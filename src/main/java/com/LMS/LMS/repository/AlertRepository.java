package com.LMS.LMS.repository;

import com.LMS.LMS.model.LibrarianAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends MongoRepository<LibrarianAlert, String> {
    // Fetch all unread alerts, sorted newest first
    List<LibrarianAlert> findByIsReadFalseOrderByTimestampDesc();
}