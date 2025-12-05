package com.LMS.LMS.controller;

import com.LMS.LMS.dto.ReportResponse;
import com.LMS.LMS.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/reports") // Restricted to ADMIN role
public class ReportController {

    @Autowired
    private ReportService reportService;

    // Requirement 10: Get basic aggregated library data
    @GetMapping("/basic-stats")
    public ResponseEntity<ReportResponse> getBasicReport() {
        ReportResponse report = reportService.generateBasicReport();
        return ResponseEntity.ok(report);
    }

    /* * NOTE: This is where the AIReportController (Phase 4) will eventually go,
     * handling natural language queries and dynamic, detailed student/money records.
     */
}