package com.LMS.LMS.service;

import com.LMS.LMS.exception.ResourceNotFoundException;
import com.LMS.LMS.model.Feedback;
import com.LMS.LMS.model.Feedback.FeedbackType;
import com.LMS.LMS.model.Feedback.RequestStatus;
import com.LMS.LMS.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    // We can potentially inject the AcquisitionService here later to fast-track request approval

    @Autowired
    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    /**
     * Allows a user (typically a Student) to submit a new piece of feedback.
     * @param feedback The feedback object containing details.
     * @return The saved Feedback object.
     */
    public Feedback submitNewFeedback(Feedback feedback) {
        // Validation: Ensure required fields are set based on type
        if (feedback.getType() == null) {
            throw new IllegalArgumentException("Feedback type must be specified.");
        }

        if (feedback.getType() == FeedbackType.ACQUISITION_REQUEST) {
            if (feedback.getRequestedBookTitle() == null || feedback.getRequestedBookTitle().trim().isEmpty()) {
                throw new IllegalArgumentException("Book title is required for an acquisition request.");
            }
            // Set initial status for a new request
            feedback.setStatus(RequestStatus.NEW);
        } else {
            // For general feedback, status fields are typically ignored
            feedback.setStatus(null);
        }

        return feedbackRepository.save(feedback);
    }

    /**
     * Retrieves all Acquisition Requests for the Librarian review panel.
     * @return List of Feedback objects where type is ACQUISITION_REQUEST.
     */
    public List<Feedback> getAllAcquisitionRequests() {
        // NOTE: This assumes your FeedbackRepository has a method to find by type.
        // If not, it falls back to filtering all, which is inefficient.
        // Assuming findByType method exists:
        return feedbackRepository.findByType(FeedbackType.ACQUISITION_REQUEST);

        /* If findByType does NOT exist, use this:
        return feedbackRepository.findAll().stream()
                .filter(f -> f.getType() == FeedbackType.ACQUISITION_REQUEST)
                .toList();
        */
    }

    /**
     * Allows the Librarian to update the status of an Acquisition Request.
     * @param requestId ID of the feedback/request item.
     * @param newStatus The new status (e.g., APPROVED_FOR_PURCHASE).
     * @return The updated Feedback object.
     */
    public Feedback updateRequestStatus(String requestId, RequestStatus newStatus) {
        Feedback request = feedbackRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Acquisition Request not found with ID: " + requestId));

        if (request.getType() != FeedbackType.ACQUISITION_REQUEST) {
            throw new IllegalArgumentException("Cannot update status on non-acquisition feedback.");
        }

        request.setStatus(newStatus);

        // Future Integration Point:
        // if (newStatus == RequestStatus.APPROVED_FOR_PURCHASE) {
        //    // Logic here to potentially create a draft Purchase Order item in AcquisitionService
        // }

        return feedbackRepository.save(request);
    }
}