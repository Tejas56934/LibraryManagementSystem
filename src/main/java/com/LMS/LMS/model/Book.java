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
    private int totalStock;
    private int availableStock;
    private String category;
    private double price; // For procurement tracking
    private LocalDateTime dateAdded = LocalDateTime.now();

    public boolean isAvailable() {
        return availableStock > 0;
    }
}
