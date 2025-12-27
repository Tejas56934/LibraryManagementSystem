package com.LMS.LMS.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "transactions")
public class Transaction {
    @Id
    private String id;

    private String bookId;      // Links to Book
    private String bookTitle;   // Stored for easier AI analysis without joining tables
    private String username;    // Links to User (Student)

    private LocalDateTime issueDate;
    private LocalDateTime dueDate;
    private LocalDateTime returnDate; // Null if not returned yet

    private String status;      // "ISSUED", "RETURNED", "OVERDUE"
    private double fineAmount;  // For Financial Insights
    private boolean isFinePaid;

    // Helper for AI to know if it's currently late
    public boolean isOverdue() {
        return returnDate == null && LocalDateTime.now().isAfter(dueDate);
    }
}