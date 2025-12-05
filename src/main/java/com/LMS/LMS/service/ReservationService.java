package com.LMS.LMS.service;

import com.LMS.LMS.exception.ResourceNotFoundException;
import com.LMS.LMS.model.Book;
import com.LMS.LMS.model.Reservation;
import com.LMS.LMS.model.ReservationStatus;
import com.LMS.LMS.repository.BookRepository;
import com.LMS.LMS.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private NotificationService notificationService; // To alert student when book is ready

    // Requirement 7: Student requests a book
    public Reservation placeReservation(String bookId, String studentId) {
        Book book = bookRepository.findByBookId(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found."));

        // 1. Check for duplicate pending reservation
        if (reservationRepository.findByBookIdAndStudentIdAndStatus(bookId, studentId, ReservationStatus.PENDING).isPresent()) {
            throw new IllegalArgumentException("You already have a pending reservation for this book.");
        }

        // 2. Create the reservation record
        Reservation reservation = new Reservation();
        reservation.setBookId(bookId);
        reservation.setStudentId(studentId);

        return reservationRepository.save(reservation);
    }

    // Requirement 7: Student can view their own pending reservations
    public List<Reservation> getStudentPendingReservations(String studentId) {
        return reservationRepository.findByStudentIdAndStatus(studentId, ReservationStatus.PENDING);
    }

    // Called by BorrowService when a book is returned (Requirement 7 logic)
    public void processBookReturn(String bookId) {
        // Find the oldest pending reservation for the returned book
        Optional<Reservation> nextReservation = reservationRepository
                .findFirstByBookIdAndStatusOrderByReservationDateAsc(bookId, ReservationStatus.PENDING);

        if (nextReservation.isPresent()) {
            Reservation reservation = nextReservation.get();

            // 1. Update reservation status to READY
            reservation.setStatus(ReservationStatus.READY_FOR_PICKUP);
            reservation.setExpiryDate(LocalDateTime.now().plusDays(3)); // Student has 3 days to pick up
            reservationRepository.save(reservation);

            // 2. Notify the student
            notificationService.triggerReservationAlert(reservation);

            // Note: We intentionally don't update the Book stock (-1) here.
            // Stock is only reduced when the librarian issues the book (BorrowController).
        }
    }

    // Optional: Librarian can manually cancel a reservation
    public void cancelReservation(String reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found."));

        reservation.setStatus(ReservationStatus.CANCELED);
        reservationRepository.save(reservation);
    }
}