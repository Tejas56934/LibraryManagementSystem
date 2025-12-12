package com.LMS.LMS.dto;

import lombok.Data;

@Data
public class StudentRequest {
    private String studentId;
    private String name;
    private String major;
    private String email;
    private String phoneNumber;
    // Password will be handled separately via AuthController registration if student self-registers
}