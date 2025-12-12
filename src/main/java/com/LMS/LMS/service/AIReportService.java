package com.LMS.LMS.service;

import com.LMS.LMS.dto.AIReportRequest;
import com.LMS.LMS.dto.AIReportResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class AIReportService {

    // --- MOCK Implementation for Requirement 10 (AI Part) ---

    public AIReportResponse generateDynamicReport(AIReportRequest request) {

        // In the future, this is where you would:
        // 1. Fetch raw data from MongoDB (BorrowRecords, Student data, etc.)
        // 2. Format the data and send it to an external AI endpoint (e.g., Gemini API).
        // 3. Receive the structured JSON report back from the AI.

        // For now, we return a mock response based on the request query

        String query = request.getQuery().toLowerCase();

        // Mock data for "student reading records"
        if (query.contains("student record") || query.contains("top reader")) {
            return AIReportResponse.builder()
                    .summary("The following is a dynamic record of the top three students who have borrowed the most books in the library's history.")
                    .tableHeaders(Arrays.asList("Student ID", "Name", "Total Books Borrowed", "Current Overdue Count"))
                    .tableData(Arrays.asList(
                            Map.of("Student ID", "S-101", "Name", "Alice Johnson", "Total Books Borrowed", 18, "Current Overdue Count", 0),
                            Map.of("Student ID", "S-102", "Name", "Bob Williams", "Total Books Borrowed", 15, "Current Overdue Count", 2),
                            Map.of("Student ID", "S-103", "Name", "Charlie Brown", "Total Books Borrowed", 12, "Current Overdue Count", 0)
                    ))
                    .generatedAt(LocalDateTime.now().toString())
                    .build();
        }

        // Mock data for "money flow"
        if (query.contains("money record") || query.contains("financial")) {
            return AIReportResponse.builder()
                    .summary("Dynamic report detailing recent financial flow, including late fees collected and book procurement expenses.")
                    .tableHeaders(Arrays.asList("Transaction Date", "Type", "Amount", "Reference ID"))
                    .tableData(Arrays.asList(
                            Map.of("Transaction Date", "2025-11-28", "Type", "Late Fee", "Amount", 5.00, "Reference ID", "BR-990"),
                            Map.of("Transaction Date", "2025-11-29", "Type", "Procurement", "Amount", -245.50, "Reference ID", "PO-105"),
                            Map.of("Transaction Date", "2025-11-30", "Type", "Late Fee", "Amount", 2.50, "Reference ID", "BR-991")
                    ))
                    .generatedAt(LocalDateTime.now().toString())
                    .build();
        }

        // Default response
        return AIReportResponse.builder()
                .summary("The AI model needs more specific context. Try querying for 'student record' or 'money flow record'.")
                .tableHeaders(Arrays.asList("Status", "Message"))
                .tableData(List.of(Map.of("Status", "Failed", "Message", "Invalid Query")))
                .generatedAt(LocalDateTime.now().toString())
                .build();
    }
}