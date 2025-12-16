package com.LMS.LMS.repository;

import com.LMS.LMS.model.Reservation;
import com.LMS.LMS.model.Reservation.ReservationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends MongoRepository<Reservation, String> {

    /**
     * Finds all active reservations for a given book, ordered by reservation date (oldest first).
     * This establishes the queue order.
     */
    List<Reservation> findByBookIdAndStatusOrderByReservationDateAsc(String bookId, ReservationStatus status);

    /**
     * Checks if a student already has an active hold on a specific book.
     */
    Optional<Reservation> findByStudentIdAndBookIdAndStatus(String studentId, String bookId, ReservationStatus status);

    List<Reservation> findByStudentIdAndStatusIn(String studentId, List<ReservationStatus> statuses);
    /**
     * Finds all reservations placed by a specific student.
     */
    List<Reservation> findByStudentId(String studentId);

    Collection<Object> findByStatus(com.LMS.LMS.model.ReservationStatus reservationStatus);
}