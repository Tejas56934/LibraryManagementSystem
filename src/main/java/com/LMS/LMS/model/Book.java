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
    private String id;

    @Indexed(unique = true)
    private String bookId;

    private String title;
    private String author;
    private String isbn;
    private long totalStock;
    private long availableStock;
    private String category;
    private double price;
    private LocalDateTime dateAdded = LocalDateTime.now();

    // --- UPDATED SHELF MANAGEMENT FIELDS ---
    private String shelfCode; // Links to the physical coordinates (e.g., A-01-S03)
    private String rackNumber; // Metadata for easier physical identification (e.g., RACK-01)

    public boolean isAvailable() {
        return availableStock > 0;
    }
}