package com.LMS.LMS.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "reservations")
public class Reservation {

    @Id
    private String id;

    private String bookId; // The unique ID of the book being reserved (BK-...)
    private String studentId; // ID of the student making the reservation

    private LocalDateTime reservationDate = LocalDateTime.now();
    private LocalDateTime expiryDate; // Date by which the student must borrow the book once available

    private ReservationStatus status = ReservationStatus.PENDING; // PENDING, READY_FOR_PICKUP, FULFILLED, CANCELED
}