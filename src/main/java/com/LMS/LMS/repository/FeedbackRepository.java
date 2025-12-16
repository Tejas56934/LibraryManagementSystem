package com.LMS.LMS.repository;

import com.LMS.LMS.model.Feedback;
import com.LMS.LMS.model.Feedback.FeedbackType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends MongoRepository<Feedback, String> {

    // Required method for Req 8: Retrieve all feedback of a specific type (ACQUISITION_REQUEST)
    List<Feedback> findByType(FeedbackType type);

    // Optional: for students to view their own requests
    Optional<List<Feedback>> findBySubmitterId(String submitterId);
}