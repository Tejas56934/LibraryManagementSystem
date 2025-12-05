package com.LMS.LMS.service;

import com.LMS.LMS.dto.FeedbackRequest;
import com.LMS.LMS.exception.BookNotFoundException;
import com.LMS.LMS.model.Book;
import com.LMS.LMS.model.Feedback;
import com.LMS.LMS.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private BookService bookService; // Needed for procurement logic

    @Autowired
    private StudentService studentService; // Assuming you have this to validate studentId

    // Requirement 8: Student submits feedback for a resource not found
    public Feedback submitFeedback(String studentId, FeedbackRequest request) {
        // Optional: Check if the book actually exists before submitting a 'Resource Not Found' feedback
        List<Book> existingBooks = bookService.searchBooks(request.getBookTitle());
        if (!existingBooks.isEmpty()) {
            throw new IllegalArgumentException("Book already exists. Please search using the main system.");
        }

        Feedback feedback = new Feedback();
        feedback.setStudentId(studentId);
        feedback.setBookTitle(request.getBookTitle());
        feedback.setAuthor(request.getAuthor());
        feedback.setIsbn(request.getIsbn());
        feedback.setStatus("PENDING");

        return feedbackRepository.save(feedback);
    }

    // Requirement 9: Librarian updates status and performs procurement
    public Feedback updateFeedbackStatus(String feedbackId, String newStatus, String notes) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new BookNotFoundException("Feedback request not found.")); // Reusing this exception for simplicity

        feedback.setStatus(newStatus.toUpperCase());
        feedback.setNotes(notes);
        feedback.setUpdateDate(LocalDateTime.now());

        // If the librarian marks it as ORDERED, you could trigger a procurement record here.
        if ("ORDERED".equalsIgnoreCase(newStatus)) {
            // Logic to track financial details of procurement would be added here
            // e.g., procurementService.recordOrder(feedback);
        }

        return feedbackRepository.save(feedback);
    }

    // Librarian can view all pending requests
    public List<Feedback> getPendingFeedback() {
        return feedbackRepository.findByStatus("PENDING");
    }
}