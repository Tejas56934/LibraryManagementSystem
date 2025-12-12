package com.LMS.LMS.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "alerts")
public class LibrarianAlert {

    @Id
    private String id;

    private String type; // OVERDUE, LOW_STOCK, RESERVATION_READY
    private String message;
    private String relatedId; // BookId or StudentId
    private boolean isRead = false;
    private LocalDateTime timestamp = LocalDateTime.now();
}