package com.LMS.LMS.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO representing the stock breakdown for a single book title
 * in the Inventory Stock Status Report.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockStatusDTO {

    // Book Metadata
    private String bookId;
    private String title;
    private String author;
    private String category;

    // Stock Counts (Use long to match database aggregation results)
    private long totalCopies;
    private long availableCopies;
    private long issuedCopies;
    private long missingCopies;

    // Calculated Metric
    private long physicalStock; // totalCopies - missingCopies
}