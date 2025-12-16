package com.LMS.LMS.controller;

import com.LMS.LMS.model.PurchaseOrder;
import com.LMS.LMS.model.Vendor;
import com.LMS.LMS.service.AcquisitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/acquisitions")
public class AcquisitionController {

    private final AcquisitionService acquisitionService;

    @Autowired
    public AcquisitionController(AcquisitionService acquisitionService) {
        this.acquisitionService = acquisitionService;
    }

    // --- Vendor Endpoints ---

    @PostMapping("/vendors")
    public ResponseEntity<Vendor> createVendor(@RequestBody Vendor vendor) {
        Vendor createdVendor = acquisitionService.createVendor(vendor);
        return new ResponseEntity<>(createdVendor, HttpStatus.CREATED);
    }

    @GetMapping("/vendors")
    public ResponseEntity<List<Vendor>> getAllVendors() {
        List<Vendor> vendors = acquisitionService.getAllVendors();
        return ResponseEntity.ok(vendors);
    }

    // --- Purchase Order Endpoints ---

    @PostMapping("/orders")
    public ResponseEntity<PurchaseOrder> createPurchaseOrder(@RequestBody PurchaseOrder order) {
        // NOTE: In a real app, you'd use a PurchaseOrderRequest DTO here instead of the model directly
        PurchaseOrder createdOrder = acquisitionService.createPurchaseOrder(order);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    @GetMapping("/orders")
    public ResponseEntity<List<PurchaseOrder>> getAllOrders() {
        List<PurchaseOrder> orders = acquisitionService.getAllPurchaseOrders();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/orders/{orderId}/receive")
    public ResponseEntity<PurchaseOrder> markOrderAsReceived(@PathVariable String orderId) {
        // This is the critical step that updates the book inventory
        PurchaseOrder updatedOrder = acquisitionService.markOrderAsReceived(orderId);
        return ResponseEntity.ok(updatedOrder);
    }
}