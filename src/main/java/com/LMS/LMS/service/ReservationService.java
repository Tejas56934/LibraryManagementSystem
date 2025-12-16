package com.LMS.LMS.service;

import com.LMS.LMS.exception.ResourceNotFoundException;
import com.LMS.LMS.model.Book;
import com.LMS.LMS.model.Reservation;
import com.LMS.LMS.model.Reservation.ReservationStatus;
import com.LMS.LMS.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final BookService bookService;
    private final NotificationService notificationService;

    // Reservation pickup grace period in hours (e.g., 48 hours)
    private static final long PICKUP_GRACE_PERIOD_HOURS = 48;

    @Autowired
    public ReservationService(
            ReservationRepository reservationRepository,
            BookService bookService,
            NotificationService notificationService) {
        this.reservationRepository = reservationRepository;
        this.bookService = bookService;
        this.notificationService = notificationService;
    }

    // --- Existing Reservation Logic (placeReservation, cancelReservation, etc.) ---

    // =========================================================================
    // NEW LOGIC FOR STUDENT VIEW (Requirement 7)
    // =========================================================================

    /**
     * Retrieves all pending reservations for a specific student.
     * Pending means status is WAITING or READY_FOR_PICKUP.
     * @param studentId The ID of the student.
     * @return List of pending Reservation objects, with queue position calculated.
     */
    public List<Reservation> getStudentPendingReservations(String studentId) {
        // Define statuses that count as 'pending' for the student dashboard
        List<ReservationStatus> pendingStatuses = Arrays.asList(
                ReservationStatus.WAITING,
                ReservationStatus.READY_FOR_PICKUP
        );

        // You'll need a custom method in ReservationRepository for this:
        // List<Reservation> findByStudentIdAndStatusIn(String studentId, List<ReservationStatus> statuses);

        // Assuming findByStudentId method can be enhanced, or we use a custom repository method:
        List<Reservation> reservations = reservationRepository.findByStudentId(studentId).stream()
                .filter(r -> pendingStatuses.contains(r.getStatus()))
                .toList();

        // Calculate dynamic queue position for each WAITING reservation
        for (Reservation reservation : reservations) {
            if (reservation.getStatus() == ReservationStatus.WAITING) {
                // Dynamically set the queue position
                reservation.setQueuePosition(calculateQueuePosition(reservation.getBookId(), reservation.getId()));
            } else {
                // If it's READY_FOR_PICKUP, the position is effectively 1
                reservation.setQueuePosition(1);
            }
        }

        return reservations;
    }

    /**
     * Helper method to calculate a student's current queue position for a book.
     * @param bookId The ID of the book.
     * @param reservationId The ID of the student's reservation.
     * @return The queue position (1, 2, 3, etc.).
     */
    private int calculateQueuePosition(String bookId, String reservationId) {
        // Find all currently WAITING reservations for this book, ordered by date (oldest first)
        List<Reservation> queue = reservationRepository
                .findByBookIdAndStatusOrderByReservationDateAsc(bookId, ReservationStatus.WAITING);

        int position = 1;
        for (Reservation r : queue) {
            if (r.getId().equals(reservationId)) {
                return position;
            }
            position++;
        }

        // Should not happen if the input reservationId is valid and status is WAITING
        return -1;
    }


    // --- Existing Reservation Logic (placeReservation, cancelReservation, getReservationsByStudentId, etc.) ---

    // Example: Implementation of the existing method with calculated position if needed
    public List<Reservation> getReservationsByStudentId(String studentId) {
        List<Reservation> reservations = reservationRepository.findByStudentId(studentId);

        // Apply queue position calculation similar to the method above if status is WAITING
        for (Reservation reservation : reservations) {
            if (reservation.getStatus() == ReservationStatus.WAITING) {
                reservation.setQueuePosition(calculateQueuePosition(reservation.getBookId(), reservation.getId()));
            }
        }
        return reservations;
    }


    @Transactional
    public Reservation placeReservation(String studentId, String bookId) {
        // 1. Validate Book Existence
        Book book = bookService.getBookByBookId(bookId);

        // 2. Pre-check: Is the book available for immediate issue?
        if (book.getAvailableStock() > 0) {
            throw new IllegalStateException("Book is currently available. Please proceed to borrow directly.");
        }

        // 3. Pre-check: Does the student already have an active hold?
        if (reservationRepository.findByStudentIdAndBookIdAndStatus(studentId, bookId, ReservationStatus.WAITING).isPresent()) {
            throw new IllegalStateException("You already have an active hold on this book.");
        }

        Reservation reservation = new Reservation();
        reservation.setStudentId(studentId);
        reservation.setBookId(bookId);
        reservation.setStatus(ReservationStatus.WAITING);

        // Queue position is dynamically determined on retrieval for accuracy

        return reservationRepository.save(reservation);
    }

    public Reservation cancelReservation(String reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        if (reservation.getStatus() == ReservationStatus.WAITING || reservation.getStatus() == ReservationStatus.READY_FOR_PICKUP) {
            reservation.setStatus(ReservationStatus.CANCELLED);

            // If READY_FOR_PICKUP, we must immediately notify the next person in line
            if (reservation.getStatus() == ReservationStatus.READY_FOR_PICKUP) {
                // Trigger the logic to find the next person (implemented in processReturnedBook)
                processReturnedBook(reservation.getBookId());
            }

            return reservationRepository.save(reservation);
        } else {
            throw new IllegalStateException("Reservation cannot be cancelled in status: " + reservation.getStatus());
        }
    }


    // =========================================================================
    // CRITICAL INTEGRATION POINT (Called by BorrowService when a book is RETURNED)
    // =========================================================================

    @Transactional
    public boolean processReturnedBook(String bookId) {
        // Find the oldest WAITING reservation for this book
        List<Reservation> waitingReservations = reservationRepository
                .findByBookIdAndStatusOrderByReservationDateAsc(bookId, ReservationStatus.WAITING);

        if (waitingReservations.isEmpty()) {
            // No one is waiting. Book becomes AVAILABLE in BorrowService.
            return false;
        }

        // Get the top reservation
        Reservation nextReservation = waitingReservations.get(0);

        // 1. Update Reservation Status and Expiry
        nextReservation.setStatus(ReservationStatus.READY_FOR_PICKUP);
        nextReservation.setExpiryDate(Instant.now().plus(PICKUP_GRACE_PERIOD_HOURS, ChronoUnit.HOURS));
        reservationRepository.save(nextReservation);

        // 2. Send Notification (Crucial Step)
        notificationService.sendReservationReadyNotification(nextReservation);

        return true;
    }
}