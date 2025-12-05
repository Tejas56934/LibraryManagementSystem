package com.LMS.LMS.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class ReportResponse {

    // Key Metrics
    private long totalStudents;
    private long totalBooksInStock;
    private long totalAvailableBooks;

    // Flow/Status Records (Requirement 10)
    private long totalBooksIssued;
    private long totalBooksOverdue;
    private long totalPendingReservations;

    // Historical Data (e.g., student reading records)
    private Map<String, Long> booksReadCount; // Map<BookId, Count>
    private Map<String, Long> studentBorrowCount; // Map<StudentId, Count>
}