package com.LMS.LMS.dto;

import lombok.Data;

@Data
public class AIReportRequest {
    // The query the librarian types (e.g., "Show me students who read the most history books.")
    private String query;
}