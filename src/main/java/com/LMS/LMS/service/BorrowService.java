package com.LMS.LMS.service;

import com.LMS.LMS.dto.BorrowRequest;
import com.LMS.LMS.exception.BookNotFoundException;
import com.LMS.LMS.model.Book;
import com.LMS.LMS.model.BorrowRecord;
import com.LMS.LMS.model.BorrowStatus;
import com.LMS.LMS.repository.BorrowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Added @Transactional import
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BorrowService {

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private BookService bookService;

    @Autowired
    private ReservationService reservationService; // Used for Requirement 7

    public List<BorrowRecord> getActiveLoans() {
        // We define what "active" means: currently issued, overdue, or being read in the office.
        List<BorrowStatus> activeStatuses = List.of(
                BorrowStatus.ISSUED,
                BorrowStatus.OVERDUE,
                BorrowStatus.READ_IN_OFFICE
        );
        return borrowRepository.findByStatusIn(activeStatuses);
    }

    // Requirement 3: Issue a book
    @Transactional // Added transaction management
    public BorrowRecord issueBook(BorrowRequest request) {
        // 1. Check if book is available and update stock (-1)
        bookService.updateBookStock(request.getBookId(), -1);

        // 2. Create the borrow record
        BorrowRecord record = new BorrowRecord();
        record.setBookId(request.getBookId());
        record.setStudentId(request.getStudentId());
        record.setDueDate(request.getDueDate());
        record.setStatus(BorrowStatus.ISSUED);

        return borrowRepository.save(record);
    }

    // Requirement 4: Stop countdown and mark as returned
    @Transactional // Added transaction management
    public BorrowRecord returnBook(String borrowRecordId) {
        BorrowRecord record = borrowRepository.findById(borrowRecordId)
                .orElseThrow(() -> new BookNotFoundException("Borrow record not found."));

        if (record.getStatus() == BorrowStatus.RETURNED) {
            throw new IllegalStateException("This book has already been returned.");
        }

        String bookId = record.getBookId();

        // 1. Update record status
        record.setReturnDate(LocalDateTime.now());
        record.setStatus(BorrowStatus.RETURNED);
        BorrowRecord returnedRecord = borrowRepository.save(record);

        // 2. Requirement 7: Process pending reservations after book is returned
        // The ReservationService will check for holds and mark the book as READY_FOR_PICKUP
        // It returns TRUE if a reservation was found and the student was notified.
        boolean isReserved = reservationService.processReturnedBook(bookId);

        // 3. Update stock (+1) ONLY if the book is NOT immediately reserved
        if (!isReserved) {
            bookService.updateBookStock(bookId, 1);
        } else {
            // Log for librarian/system check
            System.out.println("Book " + bookId + " returned and held for next reservation.");
        }

        return returnedRecord;
    }

    // Requirement 5: Log start time for reading in the office
    @Transactional // Added transaction management
    public BorrowRecord logReadInTime(String bookId, String studentId) {
        Book book = bookService.getBookByBookId(bookId);
        if (!book.isAvailable()) {
            throw new IllegalStateException("Book is currently unavailable for reading.");
        }

        // Update stock temporarily (-1)
        bookService.updateBookStock(bookId, -1);

        BorrowRecord record = new BorrowRecord();
        record.setBookId(bookId);
        record.setStudentId(studentId);
        record.setReadInTime(LocalDateTime.now());
        record.setStatus(BorrowStatus.READ_IN_OFFICE);
        return borrowRepository.save(record);
    }

    @Transactional // Added transaction management
    public BorrowRecord logReadOutTime(String borrowRecordId) {
        BorrowRecord record = borrowRepository.findById(borrowRecordId)
                .orElseThrow(() -> new BookNotFoundException("Reading log record not found."));

        if (record.getStatus() != BorrowStatus.READ_IN_OFFICE) {
            throw new IllegalStateException("This is not an active in-office reading log.");
        }

        String bookId = record.getBookId();

        // 1. Update record status
        record.setReadOutTime(LocalDateTime.now());
        record.setStatus(BorrowStatus.RETURNED);
        BorrowRecord returnedRecord = borrowRepository.save(record);

        // 2. Requirement 7: Process pending reservations after book is returned
        // Check if anyone is waiting for the book.
        boolean isReserved = reservationService.processReturnedBook(bookId);

        // 3. Update stock (+1) ONLY if the book is NOT immediately reserved
        if (!isReserved) {
            bookService.updateBookStock(bookId, 1);
        } else {
            System.out.println("Book " + bookId + " returned (from in-office) and held for next reservation.");
        }

        return returnedRecord;
    }

    // Requirement 7: Get student's personal borrow history
    public List<BorrowRecord> getStudentBorrowHistory(String studentId) {
        return borrowRepository.findByStudentId(studentId);
    }
}