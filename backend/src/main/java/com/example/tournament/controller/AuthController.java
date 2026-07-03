package com.example.tournament.controller;

import com.example.tournament.dto.request.LoginRequest;
import com.example.tournament.dto.response.ApiResponse;
import com.example.tournament.dto.response.AuthResponse;
import com.example.tournament.service.AuthenticationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationService authenticationService;

    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    /**
     * Login endpoint.
     * POST /api/auth/login
     * 
     * Request body: { "username": "admin", "password": "Admin123!" }
     * Response: { "success": true, "message": "Login successful", "data": { "token": "...", "type": "Bearer", "user": {...} } }
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        logger.info("Login attempt for user: {}", request.getUsername());

        AuthResponse authResponse = authenticationService.login(request);

        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }
}
