package com.LMS.LMS.dto.report; // or com.LMS.LMS.dto.report
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DailyUsageDTO {
    private String date;
    private long totalIssues;
}