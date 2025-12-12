package com.LMS.LMS.dto;

import com.LMS.LMS.model.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String token;
    private String username;
    private UserRole role;
}