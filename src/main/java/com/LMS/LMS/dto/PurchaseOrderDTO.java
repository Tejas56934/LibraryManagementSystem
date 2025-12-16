package com.LMS.LMS.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class PurchaseOrderDTO {
    private String orderId;
    private String vendorName;
    private LocalDate orderDate;
    private Long itemCount;
    private Double totalCost;
    private String status; // E.g., PENDING, RECEIVED, CANCELLED
}