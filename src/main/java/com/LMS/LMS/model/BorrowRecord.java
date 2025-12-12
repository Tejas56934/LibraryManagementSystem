package com.LMS.LMS.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "borrow_records")
public class BorrowRecord {

    @Id
    private String id;

    private String bookId; // Reference to the unique Book ID (BK-...)
    private String studentId; // Reference to the Student ID

    private LocalDateTime issueDate = LocalDateTime.now();
    private LocalDateTime dueDate; // Set by Librarian (Requirement 3)
    private LocalDateTime returnDate; // Set on return (Requirement 4)

    // For Requirement 5 (Reading in the office)
    private LocalDateTime readInTime;
    private LocalDateTime readOutTime;

    private BorrowStatus status = BorrowStatus.ISSUED;
    private boolean notificationSent = false;
}