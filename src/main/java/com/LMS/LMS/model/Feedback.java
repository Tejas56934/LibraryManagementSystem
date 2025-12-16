package com.LMS.LMS.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.Instant;

@Data
@Document(collection = "feedback")
public class Feedback {

    @Id
    private String id;

    private String submitterId; // Student or User ID
    private String submitterRole;

    // Type of feedback
    private FeedbackType type;

    // General message or reason
    private String message;

    // --- Specific fields for ACQUISITION REQUESTS (Req 8) ---
    private String requestedBookTitle;
    private String requestedBookAuthor;
    private String requestedBookISBN;
    private RequestStatus status = RequestStatus.NEW; // Tracks librarian action

    private Instant submissionDate = Instant.now();

    public enum FeedbackType {
        GENERAL_COMPLAINT,
        SYSTEM_ISSUE,
        ACQUISITION_REQUEST // New type for Requirement 8
    }

    public enum RequestStatus {
        NEW,
        IN_REVIEW,
        APPROVED_FOR_PURCHASE, // Leads to Req 9
        DENIED,
        FULFILLED // When the book is received (linked back from Req 9)
    }
}