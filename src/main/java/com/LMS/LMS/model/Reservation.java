package com.LMS.LMS.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.Instant;

@Data
@Document(collection = "reservations")
public class Reservation {

    @Id
    private String id;

    private String bookId; // The ID of the book being reserved
    private String studentId; // The ID of the student who placed the hold

    private Instant reservationDate = Instant.now();
    private Instant expiryDate; // Date by which the student must pick up the book

    private ReservationStatus status;
    private Integer queuePosition; // Calculated dynamically or stored for caching

    public enum ReservationStatus {
        WAITING,            // Book is currently issued to someone else
        READY_FOR_PICKUP,   // Book has been returned and is waiting for this student
        EXPIRED,            // Student failed to pick up the book in time
        CANCELLED,          // Student cancelled the hold
        FULFILLED           // Student successfully borrowed the book
    }
}