package com.LMS.LMS.service;

import com.LMS.LMS.dto.ReportResponse;
import com.LMS.LMS.model.Book;
import com.LMS.LMS.model.BorrowRecord;
import com.LMS.LMS.model.BorrowStatus;
import com.LMS.LMS.model.ReservationStatus;
import com.LMS.LMS.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private ReservationRepository reservationRepository;


    // Requirement 10: Generate comprehensive basic report
    public ReportResponse generateBasicReport() {

        // --- 1. Fetch Raw Data ---
        List<Book> allBooks = bookRepository.findAll();
        List<BorrowRecord> allBorrowRecords = borrowRepository.findAll();

        // --- 2. Calculate Key Metrics ---
        long totalStudents = studentRepository.count();
        long totalBooksInStock = allBooks.stream().mapToLong(Book::getTotalStock).sum();
        long totalAvailableBooks = allBooks.stream().mapToLong(Book::getAvailableStock).sum();

        // --- 3. Calculate Flow/Status Records ---
        long totalBooksIssued = allBorrowRecords.stream()
                .filter(r -> r.getStatus() == BorrowStatus.ISSUED || r.getStatus() == BorrowStatus.READ_IN_OFFICE)
                .count();

        long totalBooksOverdue = allBorrowRecords.stream()
                .filter(r -> r.getStatus() == BorrowStatus.OVERDUE)
                .count();

        long totalPendingReservations = reservationRepository.findByStatus(ReservationStatus.PENDING).size();


        // --- 4. Calculate Historical/Reading Records (Requirement 10 Example) ---

        // Count how many times each book has been read/borrowed (FULFILLED/RETURNED status)
        Map<String, Long> booksReadCount = allBorrowRecords.stream()
                .filter(r -> r.getStatus() == BorrowStatus.RETURNED || r.getStatus() == BorrowStatus.OVERDUE)
                .collect(Collectors.groupingBy(BorrowRecord::getBookId, Collectors.counting()));

        // Count how many books each student has borrowed (total history)
        Map<String, Long> studentBorrowCount = allBorrowRecords.stream()
                .filter(r -> r.getStatus() == BorrowStatus.RETURNED || r.getStatus() == BorrowStatus.OVERDUE || r.getStatus() == BorrowStatus.ISSUED)
                .collect(Collectors.groupingBy(BorrowRecord::getStudentId, Collectors.counting()));


        // --- 5. Build and Return Response ---
        return ReportResponse.builder()
                .totalStudents(totalStudents)
                .totalBooksInStock(totalBooksInStock)
                .totalAvailableBooks(totalAvailableBooks)
                .totalBooksIssued(totalBooksIssued)
                .totalBooksOverdue(totalBooksOverdue)
                .totalPendingReservations(totalPendingReservations)
                .booksReadCount(booksReadCount)
                .studentBorrowCount(studentBorrowCount)
                .build();
    }
}