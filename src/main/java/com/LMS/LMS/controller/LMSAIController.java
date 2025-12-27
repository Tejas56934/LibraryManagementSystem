package com.LMS.LMS.controller;

import com.LMS.LMS.model.Book;
import com.LMS.LMS.model.Transaction;
import com.LMS.LMS.repository.BookRepository;
import com.LMS.LMS.repository.TransactionRepository;
import com.LMS.LMS.service.GroqService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*") // Allow React to access
public class LMSAIController {

    @Autowired
    private GroqService groqService;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    // =================================================================
    // 1. GENERAL ASSISTANT (Chat Mode)
    // =================================================================
    @PostMapping("/chat")
    public String chatWithAI(@RequestBody Map<String, String> request) {
        String userQuery = request.get("query");
        // Pass NULL as data -> Triggers "General Chat" mode in GroqService
        return groqService.getAIAnalysis(userQuery, null);
    }

    // =================================================================
    // 2. SMART DATA ANALYSIS (Inventory & Trends)
    // =================================================================
    @PostMapping("/analyze-inventory")
    public String analyzeInventory(@RequestBody Map<String, String> request) {
        String userQuery = request.get("query");

        try {
            // Fetch all books (limit fields if needed to save token space)
            List<Book> allBooks = bookRepository.findAll();
            String dataContext = objectMapper.writeValueAsString(allBooks);

            return groqService.getAIAnalysis(userQuery, dataContext);
        } catch (Exception e) {
            return "{\"summary\": \"Error fetching data\", \"tableData\": []}";
        }
    }

    // =================================================================
    // 3. FINANCIAL INSIGHTS (Fines & Overdue)
    // =================================================================
    @PostMapping("/analyze-financials")
    public String analyzeFinancials(@RequestBody Map<String, String> request) {
        String userQuery = request.get("query");

        try {
            // Fetch only transactions that have fines or are overdue
            List<Transaction> financialData = transactionRepository.findByFineAmountGreaterThan(0);

            // Also add currently issued books to see potential future fines
            List<Transaction> issuedBooks = transactionRepository.findByStatus("ISSUED");
            financialData.addAll(issuedBooks);

            String dataContext = objectMapper.writeValueAsString(financialData);

            return groqService.getAIAnalysis(userQuery, dataContext);
        } catch (Exception e) {
            return "{\"summary\": \"Error fetching financial data\", \"tableData\": []}";
        }
    }

    // =================================================================
    // 4. DATA CLEANING & FIXING (Typos & Formatting)
    // =================================================================
    @PostMapping("/clean-data")
    public String cleanData(@RequestBody Map<String, String> request) {
        try {
            // We usually don't need a user query here, we just ask the AI to find issues
            List<Book> allBooks = bookRepository.findAll();
            String dataContext = objectMapper.writeValueAsString(allBooks);

            String specificPrompt = "Check the 'title' and 'author' fields in the provided data for typos, " +
                    "inconsistent capitalization, or duplicate entries. " +
                    "Return a table with headers: ['Original Title', 'suggested_fix', 'Reason'].";

            return groqService.getAIAnalysis(specificPrompt, dataContext);
        } catch (Exception e) {
            return "{\"summary\": \"Error processing data cleaning\", \"tableData\": []}";
        }
    }
}