package com.LMS.LMS.dto;

import java.util.List;
import java.util.Map;

public class AIReportResponse {
    private String summary;
    private List<String> tableHeaders;
    private List<Object> tableData;
    private String generatedAt;

    // Getters and Setters
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getTableHeaders() { return tableHeaders; }
    public void setTableHeaders(List<String> tableHeaders) { this.tableHeaders = tableHeaders; }

    public List<Object> getTableData() { return tableData; }
    public void setTableData(List<Object> tableData) { this.tableData = tableData; }

    public String getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(String generatedAt) { this.generatedAt = generatedAt; }
}