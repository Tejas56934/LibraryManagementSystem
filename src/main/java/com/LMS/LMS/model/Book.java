package com.LMS.LMS.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "books")
public class Book {

    @Id
    private String id; // MongoDB default ID

    @Indexed(unique = true)
    private String bookId; // The new, unique, user-facing ID (Requirement 1)

    private String title;
    private String author;
    private String isbn;

    private long totalStock;    // Changed to long for consistency
    private long availableStock; // Changed to long for consistency

    private String category;
    private double price; // For procurement tracking
    private LocalDateTime dateAdded = LocalDateTime.now();

    // --- NEW FIELDS FOR SHELF MANAGEMENT (Requirement: Find Book) ---
    /**
     * Unique identifier for the exact physical shelving location (e.g., Aisle-03-R2-S1).
     * This links the book to the Shelf entity which holds the physical map coordinates.
     */
    private String shelfCode;

    public boolean isAvailable() {
        return availableStock > 0;
    }
}