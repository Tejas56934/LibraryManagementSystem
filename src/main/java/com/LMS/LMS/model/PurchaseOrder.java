package com.LMS.LMS.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.Instant;
import java.util.List;

@Data
@Document(collection = "purchase_orders")
public class PurchaseOrder {

    @Id
    private String id;

    private String vendorId; // Link to the Vendor model
    private String vendorName; // Redundant data for easier reporting
    private Instant orderDate = Instant.now();
    private PurchaseOrderStatus status = PurchaseOrderStatus.PLACED;
    private Instant expectedDeliveryDate;
    private Instant receivedDate;
    private List<OrderItem> items;
    private Double totalCost;

    public enum PurchaseOrderStatus {
        PLACED, SHIPPED, RECEIVED, CANCELLED
    }

    // Inner class to detail the books in the order
    @Data
    public static class OrderItem {
        private String bookTitle;
        private String isbn;
        private Integer quantity;
        private Double unitPrice;

        public OrderItem() {}

        public OrderItem(String bookTitle, String isbn, Integer quantity, Double unitPrice) {
            this.bookTitle = bookTitle;
            this.isbn = isbn;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
        }
    }
}