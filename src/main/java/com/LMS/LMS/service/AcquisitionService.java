package com.LMS.LMS.service;

import com.LMS.LMS.exception.ResourceNotFoundException;
import com.LMS.LMS.model.PurchaseOrder;
import com.LMS.LMS.model.PurchaseOrder.PurchaseOrderStatus;
import com.LMS.LMS.model.PurchaseOrder.OrderItem;
import com.LMS.LMS.model.Vendor;
import com.LMS.LMS.repository.PurchaseOrderRepository;
import com.LMS.LMS.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Added for transactional safety
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class AcquisitionService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final VendorRepository vendorRepository;
    private final BookService bookService; // Injected BookService for inventory update

    @Autowired
    public AcquisitionService(
            PurchaseOrderRepository purchaseOrderRepository,
            VendorRepository vendorRepository,
            BookService bookService) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.vendorRepository = vendorRepository;
        this.bookService = bookService; // Wiring up the dependency
    }

    // --- Vendor Operations ---

    public Vendor createVendor(Vendor vendor) {
        return vendorRepository.save(vendor);
    }

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    public Optional<Vendor> getVendorById(String id) {
        return vendorRepository.findById(id);
    }

    // --- Purchase Order Operations ---

    public PurchaseOrder createPurchaseOrder(PurchaseOrder order) {
        // 1. Validate Vendor existence
        Vendor vendor = vendorRepository.findById(order.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with ID: " + order.getVendorId()));

        // 2. Set redundant data and initial status
        order.setVendorName(vendor.getName());
        order.setStatus(PurchaseOrderStatus.PLACED);

        // 3. Calculate total cost
        Double total = order.getItems().stream()
                .mapToDouble(item -> item.getQuantity() * item.getUnitPrice())
                .sum();
        order.setTotalCost(total);

        return purchaseOrderRepository.save(order);
    }

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    /**
     * Marks a Purchase Order as received and updates the library's inventory stock.
     * @param orderId The ID of the order to mark as received.
     * @return The updated PurchaseOrder.
     */
    @Transactional // Ensures atomicity: either all stock updates happen, or none do.
    public PurchaseOrder markOrderAsReceived(String orderId) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + orderId));

        if (order.getStatus() == PurchaseOrderStatus.RECEIVED) {
            throw new IllegalStateException("Order has already been marked as received.");
        }

        // 1. Update Purchase Order status
        order.setStatus(PurchaseOrderStatus.RECEIVED);
        order.setReceivedDate(Instant.now());

        // 2. Update Inventory (Crucial Step for Requirement 9)
        for (OrderItem item : order.getItems()) {
            // Call the new method in BookService to update total and available stock
            try {
                bookService.addStockFromAcquisition(
                        item.getIsbn(),
                        item.getBookTitle(),
                        item.getQuantity()
                );
            } catch (Exception e) {
                // Handle potential error during stock update, perhaps logging it or re-throwing
                // to rollback the transaction.
                throw new IllegalStateException("Failed to update inventory for ISBN " + item.getIsbn() + ". Error: " + e.getMessage());
            }
        }

        // 3. Save the updated Purchase Order
        return purchaseOrderRepository.save(order);
    }
}