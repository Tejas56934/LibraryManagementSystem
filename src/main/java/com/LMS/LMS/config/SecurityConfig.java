package com.LMS.LMS.config;

import com.LMS.LMS.util.JwtRequestFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

    // ❌ REMOVED: @Autowired private AuthService authService;
    // This was the remaining cause of the circular dependency.
    // Spring Security will automatically locate AuthService (UserDetailsService).

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            // ✅ Fix applied: Injecting JwtRequestFilter via method parameter to break cycle.
            JwtRequestFilter jwtRequestFilter) throws Exception {

        http
                // 1. Disable CSRF for stateless API
                .csrf(AbstractHttpConfigurer::disable)

                // 2. Add CORS configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .authorizeHttpRequests(auth -> auth
                        // 1. Public/Authentication Endpoints
                        .requestMatchers("/api/v1/auth/**").permitAll() // Login/Registration
                        .requestMatchers("/api/v1/books/available").permitAll() // Public Book Search (Requirement 6)

                        // 2. CRITICAL: Administrative Endpoints
                        // Requires the user to have the ADMIN role (e.g., /admin/students, /admin/borrow/issue)
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                        // 3. Student Self-Service Endpoints (e.g., /student/reservations, /student/feedback)
                        // Allows both Admin (Librarian) and Student roles to access self-service features.
                        .requestMatchers("/api/v1/student/**").hasAnyRole("ADMIN", "STUDENT")

                        // 4. Any other request must be authenticated (prevents unauthorized access to unspecified paths)
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
        // This bean uses the configured UserDetailsService (AuthService) and PasswordEncoder
        return authenticationConfiguration.getAuthenticationManager();
    }
}