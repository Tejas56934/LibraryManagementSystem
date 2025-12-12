package com.LMS.LMS.controller;

import com.LMS.LMS.dto.AIReportRequest;
import com.LMS.LMS.dto.AIReportResponse;
import com.LMS.LMS.service.AIReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/ai-reports") // Restricted to ADMIN role
public class AIReportController {

    @Autowired
    private AIReportService aiReportService;

    // Requirement 10: Endpoint for dynamic, AI-style reporting
    @PostMapping("/generate")
    public ResponseEntity<AIReportResponse> generateReport(@RequestBody AIReportRequest request) {
        AIReportResponse report = aiReportService.generateDynamicReport(request);
        return ResponseEntity.ok(report);
    }
}