package com.LMS.LMS.config;

import com.LMS.LMS.util.JwtRequestFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;

import java.util.Arrays; // Added for List.of/Arrays.asList support

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtRequestFilter jwtRequestFilter) throws Exception {

        http
                // 1. Disable CSRF for stateless API
                .csrf(AbstractHttpConfigurer::disable)

                // 2. Add CORS configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .authorizeHttpRequests(auth -> auth
                        // 1. Public/Authentication Endpoints
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/books/available").permitAll()

                        // 2. ACQUISITIONS & FEEDBACK
                        .requestMatchers(HttpMethod.POST, "/api/v1/admin/feedback").authenticated()
                        .requestMatchers("/api/v1/admin/feedback/requests/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/v1/admin/acquisitions/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/v1/admin/shelf/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/v1/admin/shelf/location/**").hasAuthority("ROLE_ADMIN")

                        // 3. RESERVATIONS
                        .requestMatchers(HttpMethod.POST, "/api/v1/reservations").hasAuthority("ROLE_STUDENT")
                        .requestMatchers("/api/v1/reservations/**").hasAnyAuthority("ROLE_STUDENT", "ROLE_ADMIN")

                        // 4. ADMIN FEATURES
                        .requestMatchers("/api/v1/students/import/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/v1/books/import/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/v1/students/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/v1/books/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/v1/borrow/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/v1/report/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/v1/admin/stock-status").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/v1/admin/books/download-template").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/v1/admin/ai-reports/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/v1/admin/report/**").hasAuthority("ROLE_ADMIN")

                        // AI Routes
                        .requestMatchers("/api/ai/**").authenticated()

                        // 5. Any other request must be authenticated
                        .anyRequest().authenticated()
                )

                // 4. Configure Session Management to be stateless (JWT)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 5. Add JWT filter before the standard filter
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // --- Bean Definitions ---

    // Global CORS Configuration
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // -----------------------------------------------------------------
        // 👇 CRITICAL FIX: Added your Netlify URL here
        // -----------------------------------------------------------------
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",             // Keep for local testing
            "https://libraai.netlify.app"        // <--- THIS FIXES YOUR ERROR
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // Password Encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public GrantedAuthoritiesMapper grantedAuthoritiesMapper() {
        return (authorities) -> authorities.stream()
                .map(authority -> {
                    String role = authority.getAuthority();
                    if (!role.startsWith("ROLE_")) {
                        role = "ROLE_" + role;
                    }
                    return new SimpleGrantedAuthority(role);
                })
                .toList();
    }

    // Authentication Manager
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
