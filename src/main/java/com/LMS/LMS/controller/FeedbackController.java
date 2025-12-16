package com.LMS.LMS.controller;

import com.LMS.LMS.model.Feedback;
import com.LMS.LMS.model.Feedback.RequestStatus;
import com.LMS.LMS.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Autowired
    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    /**
     * POST /api/v1/feedback
     * Endpoint for students/users to submit any type of feedback (including ACQUISITION_REQUEST).
     */
    @PostMapping
    public ResponseEntity<Feedback> submitFeedback(@RequestBody Feedback feedback) {
        // NOTE: In a real application, security context would be used to set submitterId/Role
        Feedback newFeedback = feedbackService.submitNewFeedback(feedback);
        return new ResponseEntity<>(newFeedback, HttpStatus.CREATED);
    }

    /**
     * GET /api/v1/feedback/requests
     * Endpoint for Librarians to view all pending acquisition requests (Req 8).
     */
    @GetMapping("/requests")
    public ResponseEntity<List<Feedback>> getAllAcquisitionRequests() {
        // NOTE: This endpoint should be protected by Spring Security for ADMIN only
        List<Feedback> requests = feedbackService.getAllAcquisitionRequests();
        return ResponseEntity.ok(requests);
    }

    /**
     * PUT /api/v1/feedback/requests/{id}/status
     * Endpoint for Librarians to update the status of a request.
     */
    @PutMapping("/requests/{id}/status")
    public ResponseEntity<Feedback> updateRequestStatus(
            @PathVariable String id,
            @RequestParam RequestStatus status) {

        Feedback updatedRequest = feedbackService.updateRequestStatus(id, status);
        return ResponseEntity.ok(updatedRequest);
    }
}