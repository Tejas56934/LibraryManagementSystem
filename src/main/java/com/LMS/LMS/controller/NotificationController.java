package com.LMS.LMS.controller;

import com.LMS.LMS.model.LibrarianAlert;
import com.LMS.LMS.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/notifications") // Admin access only
public class NotificationController {

    @Autowired
    private AlertRepository alertRepository;

    // Get all unread alerts
    @GetMapping("/unread")
    public ResponseEntity<List<LibrarianAlert>> getUnreadAlerts() {
        return ResponseEntity.ok(alertRepository.findByIsReadFalseOrderByTimestampDesc());
    }

    // Mark alerts as read
    @PostMapping("/mark-read/{alertId}")
    public ResponseEntity<LibrarianAlert> markAsRead(@PathVariable String alertId) {
        LibrarianAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        alert.setRead(true);
        return ResponseEntity.ok(alertRepository.save(alert));
    }
}