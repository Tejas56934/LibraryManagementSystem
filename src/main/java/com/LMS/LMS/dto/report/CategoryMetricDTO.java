package com.LMS.LMS.dto.report;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryMetricDTO {
    private String category;
    private long usageCount;
}