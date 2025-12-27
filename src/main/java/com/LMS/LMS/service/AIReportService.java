package com.LMS.LMS.service;

import com.LMS.LMS.dto.AIReportRequest;
import com.LMS.LMS.dto.AIReportResponse;
import com.LMS.LMS.model.Book;
import com.LMS.LMS.model.BorrowRecord;
import com.LMS.LMS.model.Student;
import com.LMS.LMS.repository.BookRepository;
import com.LMS.LMS.repository.BorrowRepository;
import com.LMS.LMS.repository.StudentRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AIReportService {

    @Autowired
    private GroqService groqService;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public AIReportResponse generateDynamicReport(AIReportRequest request) {

        // 1. Fetch Raw Data (Limited)
        List<Book> rawBooks = bookRepository.findAll().stream().limit(25).collect(Collectors.toList());
        List<Student> rawStudents = studentRepository.findAll().stream().limit(25).collect(Collectors.toList());
        List<BorrowRecord> rawLoans = borrowRepository.findAll().stream().limit(25).collect(Collectors.toList());

        // 2. SANITIZE DATA (The Fix)
        // We manually build simple maps to ensure NO images, NO heavy text, NO recursion.
        Map<String, Object> simplifiedSnapshot = new HashMap<>();

        // Simplify Books
        List<Map<String, Object>> simpleBooks = new ArrayList<>();
        for (Book b : rawBooks) {
            Map<String, Object> m = new HashMap<>();
            m.put("title", b.getTitle());
            m.put("author", b.getAuthor());
            m.put("category", b.getCategory());
            m.put("stock", b.getAvailableStock());
            simpleBooks.add(m);
        }
        simplifiedSnapshot.put("books", simpleBooks);

        // Simplify Students
        List<Map<String, Object>> simpleStudents = new ArrayList<>();
        for (Student s : rawStudents) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getStudentId()); // or s.getId()
            m.put("name", s.getName());
            // m.put("email", s.getEmail()); // Add only if needed
            simpleStudents.add(m);
        }
        simplifiedSnapshot.put("students", simpleStudents);

        // Simplify Loans
        List<Map<String, Object>> simpleLoans = new ArrayList<>();
        for (BorrowRecord r : rawLoans) {
            Map<String, Object> m = new HashMap<>();
            m.put("bookId", r.getBookId());
            m.put("studentId", r.getStudentId());
            m.put("status", r.getStatus()); // ISSUED, RETURNED
            m.put("borrowDate", r.getBorrowDate() != null ? r.getBorrowDate().toString() : "");
            simpleLoans.add(m);
        }
        simplifiedSnapshot.put("loans", simpleLoans);


        try {
            // 3. Convert Simplified Map to JSON
            String contextJson = objectMapper.writeValueAsString(simplifiedSnapshot);

            // DEBUG: Print payload size to Console to prove it's small now
            System.out.println("✅ Generated Clean Context Size: " + contextJson.length() + " chars");

            // 4. Send to AI
            String rawAiResponse = groqService.getAIAnalysis(request.getQuery(), contextJson);

            // 5. Clean & Parse
            String cleanJson = cleanAiResponse(rawAiResponse);
            AIReportResponse response = objectMapper.readValue(cleanJson, AIReportResponse.class);

            if (response.getGeneratedAt() == null) {
                response.setGeneratedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
            }

            return response;

        } catch (Exception e) {
            e.printStackTrace(); // Print full error to console
            AIReportResponse errorResponse = new AIReportResponse();
            errorResponse.setSummary("System Error: " + e.getMessage());
            return errorResponse;
        }
    }

    private String cleanAiResponse(String response) {
        if (response == null) return "{}";
        if (response.contains("```json")) {
            return response.replace("```json", "").replace("```", "").trim();
        } else if (response.contains("```")) {
            return response.replace("```", "").trim();
        }
        return response;
    }
}