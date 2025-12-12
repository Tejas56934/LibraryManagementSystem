package com.LMS.LMS.repository;

import com.LMS.LMS.model.Reservation;
import com.LMS.LMS.model.ReservationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends MongoRepository<Reservation, String> {
    List<Reservation> findByStatus(ReservationStatus status);
    // Find the oldest pending reservation for a specific book
    Optional<Reservation> findFirstByBookIdAndStatusOrderByReservationDateAsc(String bookId, ReservationStatus status);

    // Check if a student already has a pending reservation for a specific book
    Optional<Reservation> findByBookIdAndStudentIdAndStatus(String bookId, String studentId, ReservationStatus status);

    // Get all pending reservations for a student
    List<Reservation> findByStudentIdAndStatus(String studentId, ReservationStatus status);
}