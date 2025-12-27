package com.LMS.LMS.repository;

import com.LMS.LMS.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {

    // For "Who is late?" Analysis
    List<Transaction> findByStatus(String status);

    // For "Financial Insights" (History of paid/unpaid fines)
    List<Transaction> findByFineAmountGreaterThan(double amount);

    // For finding a specific user's history
    List<Transaction> findByUsername(String username);
}