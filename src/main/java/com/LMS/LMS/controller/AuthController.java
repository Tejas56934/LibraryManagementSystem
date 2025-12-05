package com.LMS.LMS.controller;

import com.LMS.LMS.dto.LoginRequest;
import com.LMS.LMS.dto.LoginResponse;
import com.LMS.LMS.model.User;
import com.LMS.LMS.model.UserRole;
import com.LMS.LMS.service.AuthService;
import com.LMS.LMS.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // -----------------------------------------
    //               LOGIN
    // -----------------------------------------
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> createAuthenticationToken(@RequestBody LoginRequest loginRequest) {

        // Authenticate username & password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        // Load full user details
        final UserDetails userDetails =
                authService.loadUserByUsername(loginRequest.getUsername());

        // Generate JWT Token
        final String jwt = jwtUtil.generateToken(userDetails);

        // Get role from authorities
        UserRole role = UserRole.valueOf(
                userDetails.getAuthorities()
                        .stream()
                        .findFirst()
                        .get()
                        .getAuthority()
                        .replace("ROLE_", "")
        );

        return ResponseEntity.ok(
                LoginResponse.builder()
                        .token(jwt)
                        .username(userDetails.getUsername())
                        .role(role)
                        .build()
        );
    }

    // -----------------------------------------
    //        REGISTER ADMIN
    // -----------------------------------------
    @PostMapping("/register/admin")
    public ResponseEntity<User> registerAdmin(@RequestBody User user) {
        user.setRole(UserRole.ADMIN);
        User registeredUser = authService.registerNewUser(user);
        return ResponseEntity.ok(registeredUser);
    }

    // -----------------------------------------
    //      REGISTER STUDENT (Optional)
    // -----------------------------------------
    @PostMapping("/register/student")
    public ResponseEntity<User> registerStudent(@RequestBody User user) {
        user.setRole(UserRole.STUDENT);
        User registeredUser = authService.registerNewUser(user);
        return ResponseEntity.ok(registeredUser);
    }

    // -----------------------------------------
    //     FOR HASHING PASSWORDS TEMPORARILY
    // -----------------------------------------
    @GetMapping("/hash")
    public String getPasswordHash(@RequestParam String password) {
        return passwordEncoder.encode(password);
    }
}
