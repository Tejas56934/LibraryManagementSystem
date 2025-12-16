package com.LMS.LMS.controller;

import com.LMS.LMS.model.Reservation;
import com.LMS.LMS.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    @Autowired
    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    /**
     * POST /api/v1/reservations
     * Allows a student to place a hold on a book (Req 7).
     * NOTE: studentId should be extracted from the authenticated user context.
     */
    @PostMapping
    public ResponseEntity<Reservation> placeReservation(
            @RequestParam String bookId,
            @RequestParam String studentId) { // Replace with security context

        Reservation newReservation = reservationService.placeReservation(studentId, bookId);
        return new ResponseEntity<>(newReservation, HttpStatus.CREATED);
    }

    /**
     * GET /api/v1/reservations/my
     * Retrieves all active reservations for the logged-in student (Req 7).
     */
    @GetMapping("/my")
    public ResponseEntity<List<Reservation>> getMyReservations(@RequestParam String studentId) { // Replace with security context

        List<Reservation> reservations = reservationService.getReservationsByStudentId(studentId);
        return ResponseEntity.ok(reservations);
    }

    /**
     * PUT /api/v1/reservations/{id}/cancel
     * Allows a student to cancel a hold.
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Reservation> cancelReservation(@PathVariable String id) {

        Reservation cancelledReservation = reservationService.cancelReservation(id);
        return ResponseEntity.ok(cancelledReservation);
    }
}