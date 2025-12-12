package com.LMS.LMS.controller;

import com.LMS.LMS.dto.FeedbackRequest;
import com.LMS.LMS.model.Feedback;
import com.LMS.LMS.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    // Requirement 8: Student submits Resource Not Found feedback (Role: STUDENT)
    @PostMapping("/student/feedback")
    public ResponseEntity<Feedback> submitFeedback(
            @AuthenticationPrincipal UserDetails userDetails, // Get authenticated user details
            @RequestBody FeedbackRequest request) {

        // Assuming your Student ID is the same as the authenticated username
        String studentId = userDetails.getUsername();
        Feedback feedback = feedbackService.submitFeedback(studentId, request);
        return ResponseEntity.ok(feedback);
    }

    // Requirement 9: Librarian views pending requests (Role: ADMIN)
    @GetMapping("/admin/feedback/pending")
    public ResponseEntity<List<Feedback>> getPendingFeedback() {
        List<Feedback> feedbackList = feedbackService.getPendingFeedback();
        return ResponseEntity.ok(feedbackList);
    }

    // Requirement 9: Librarian updates status (Procurement decision) (Role: ADMIN)
    @PutMapping("/admin/feedback/{feedbackId}")
    public ResponseEntity<Feedback> updateFeedbackStatus(
            @PathVariable String feedbackId,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {

        Feedback updatedFeedback = feedbackService.updateFeedbackStatus(feedbackId, status, notes);
        return ResponseEntity.ok(updatedFeedback);
    }
}