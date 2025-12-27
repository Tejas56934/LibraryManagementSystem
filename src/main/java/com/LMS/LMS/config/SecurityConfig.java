package com.LMS.LMS.config;

import com.LMS.LMS.util.JwtRequestFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // CRITICAL: Import HttpMethod
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
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

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

                        // 2. ACQUISITIONS & FEEDBACK (Req 8 & 9)
                        // A. Students/Users can POST feedback/requests
                        .requestMatchers(HttpMethod.POST, "/api/v1/admin/feedback").authenticated() // <-- FIX 403 ERROR: Allows any logged-in user to submit

                        // B. Librarians (Admin) manage requests and acquisitions
                        .requestMatchers("/api/v1/admin/feedback/requests/**").hasAuthority("ROLE_ADMIN") // GET/PUT requests queue
                        .requestMatchers("/api/v1/admin/acquisitions/**").hasAuthority("ROLE_ADMIN") // Orders and Vendors (Req 9)
                        .requestMatchers("/api/v1/admin/shelf/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/v1/admin/shelf/location/**").hasAuthority("ROLE_ADMIN")
                        // 3. RESERVATIONS (Req 7)
                        // Students can place holds and view their own list
                        .requestMatchers(HttpMethod.POST, "/api/v1/reservations").hasAuthority("ROLE_STUDENT")
                        .requestMatchers("/api/v1/reservations/**").hasAnyAuthority("ROLE_STUDENT", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/admin/feedback").authenticated()
                        // 4. ADMIN FEATURES (Librarian CRUD, Issue/Return)
                        // Requires the ADMIN role for inventory management, issuing books, etc.
                        // I am removing your original broad rules and replacing them with specifics:
                        .requestMatchers("/api/v1/students/import/**").hasAuthority("ROLE_ADMIN") // Student roster import
                        .requestMatchers("/api/v1/books/import/**").hasAuthority("ROLE_ADMIN")     // Book inventory import
                        .requestMatchers("/api/v1/students/**").hasAuthority("ROLE_ADMIN")         // Student CRUD
                        .requestMatchers("/api/v1/books/**").hasAuthority("ROLE_ADMIN")            //Books CRUD
                        .requestMatchers("/api/v1/borrow/**").hasAuthority("ROLE_ADMIN")          // Issue/Return
                        .requestMatchers("/api/v1/report/**").hasAuthority("ROLE_ADMIN")          // Reporting
                        .requestMatchers("/api/v1/admin/stock-status").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/v1/admin/books/download-template").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/v1/admin/ai-reports/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/auth/**").permitAll()  // Login is public
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
        configuration.addAllowedOrigin("http://localhost:3000"); // Allow React frontend
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
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
        // Ensure roles always start with 'ROLE_' when mapping authorities (CRITICAL)
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