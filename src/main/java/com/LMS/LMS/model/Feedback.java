package com.LMS.LMS.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "feedback")
public class Feedback {
    @Id
    private String id;

    private String studentId;
    private String bookTitle; // Title of the book requested
    private String author;
    private String isbn;

    private String status = "PENDING"; // PENDING, REJECTED, ORDERED
    private String notes; // Librarian's notes

    private LocalDateTime submissionDate = LocalDateTime.now();
    private LocalDateTime updateDate;
}