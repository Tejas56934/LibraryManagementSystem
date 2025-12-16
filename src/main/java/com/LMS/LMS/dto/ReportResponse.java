package com.LMS.LMS.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor; // ADDED
import java.util.Map;

@Data
@Builder
@NoArgsConstructor // ADDED
@AllArgsConstructor // ADDED
public class ReportResponse {

    // Key Metrics (Already using long, which is correct)
    private long totalStudents;
    private long totalBooksInStock;
    private long totalAvailableBooks;

    // Flow/Status Records
    private long totalBooksIssued;
    private long totalBooksOverdue;
    private long totalPendingReservations;

    // Historical Data (Map values using Long, which is correct)
    private Map<String, Long> booksReadCount; // Map<BookId, Count>
    private Map<String, Long> studentBorrowCount; // Map<StudentId, Count>
}