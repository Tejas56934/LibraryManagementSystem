package com.LMS.LMS.dto;


import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BorrowRequest {
    private String bookId;
    private String studentId;
    private LocalDateTime dueDate; // Used for standard borrowing
}