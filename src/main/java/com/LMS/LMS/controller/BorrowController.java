package com.LMS.LMS.controller;


import com.LMS.LMS.dto.BorrowRequest;
import com.LMS.LMS.model.BorrowRecord;
import com.LMS.LMS.model.Reservation;
import com.LMS.LMS.service.BorrowService;
import com.LMS.LMS.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/borrow") // Restricted to ADMIN role
public class BorrowController {

    @Autowired
    BorrowService borrowService;


    @Autowired
    ReservationService reservationService;

    @GetMapping("/active")
    public ResponseEntity<List<BorrowRecord>> getActiveTransactions() {
        List<BorrowRecord> activeLoans = borrowService.getActiveLoans();
        return ResponseEntity.ok(activeLoans);
    }

    // Requirement 3: Issue a book to a student
    @PostMapping("/issue")
    public ResponseEntity<BorrowRecord> issueBook(@RequestBody BorrowRequest request) {
        BorrowRecord record = borrowService.issueBook(request);
        // The service layer handles stock update and implicitly triggers the notification countdown
        return ResponseEntity.ok(record);
    }

    // Requirement 4: Stop countdown and mark as returned
    @PostMapping("/return/{borrowRecordId}")
    public ResponseEntity<BorrowRecord> returnBook(@PathVariable String borrowRecordId) {
        BorrowRecord record = borrowService.returnBook(borrowRecordId);
        // The service layer handles stock update and stops the notification process
        return ResponseEntity.ok(record);
    }

    // Requirement 5: Log start time for reading in the office
    @PostMapping("/read-log/in")
    public ResponseEntity<BorrowRecord> logReadInTime(@RequestParam String bookId, @RequestParam String studentId) {
        // You might use a DTO here instead of two separate request params
        BorrowRecord record = borrowService.logReadInTime(bookId, studentId);
        return ResponseEntity.ok(record);
    }

    // Requirement 6: Log end time for reading in the office
    @PostMapping("/read-log/out/{borrowRecordId}")
    public ResponseEntity<BorrowRecord> logReadOutTime(@PathVariable String borrowRecordId) {
        BorrowRecord record = borrowService.logReadOutTime(borrowRecordId);
        return ResponseEntity.ok(record);
    }

    // Requirement 7: Student views their own borrow history
    @GetMapping("/student/borrow/history")
    public ResponseEntity<List<BorrowRecord>> getMyBorrowHistory(@AuthenticationPrincipal UserDetails userDetails) {
        String studentId = userDetails.getUsername();
        return ResponseEntity.ok(borrowService.getStudentBorrowHistory(studentId));
    }

    // Requirement 8: Student views their own reservations
    @GetMapping("/student/reservations")
    public ResponseEntity<List<Reservation>> getMyReservations(@AuthenticationPrincipal UserDetails userDetails) {
        String studentId = userDetails.getUsername();
        return ResponseEntity.ok(reservationService.getStudentPendingReservations(studentId));
    }

    // Additional endpoint to view a student's history (Useful for Librarian)
    @GetMapping("/history/{studentId}")
    public ResponseEntity<?> getStudentHistory(@PathVariable String studentId) {
        return ResponseEntity.ok(borrowService.getStudentBorrowHistory(studentId));
    }
}