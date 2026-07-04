package com.example.tournament.service;

import com.example.tournament.dto.request.LoginRequest;
import com.example.tournament.dto.request.RegisterRequest;
import com.example.tournament.dto.response.AuthResponse;
import com.example.tournament.dto.response.UserResponse;
import com.example.tournament.entity.User;
import com.example.tournament.enums.UserRole;
import com.example.tournament.exception.ConflictException;
import com.example.tournament.repository.UserRepository;
import com.example.tournament.util.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationService {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public AuthenticationService(UserRepository userRepository,
                                  JwtService jwtService,
                                  AuthenticationManager authenticationManager,
                                  PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Register a new user account with role USER.
     * Returns a JWT so the user is immediately logged in after registration.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username is already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already in use: " + request.getEmail());
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.USER)
                .build();

        User saved = userRepository.save(user);
        logger.info("New user registered: username={}", saved.getUsername());

        String token = jwtService.generateToken(saved);

        UserResponse userResponse = new UserResponse();
        userResponse.setId(saved.getId());
        userResponse.setUsername(saved.getUsername());
        userResponse.setEmail(saved.getEmail());
        userResponse.setRole(saved.getRole());

        return new AuthResponse(token, userResponse);
    }

    /**
     * Login user dengan username dan password.
     * Return JWT token dan user info jika credentials valid.
     */
    public AuthResponse login(LoginRequest request) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            logger.info("User authenticated successfully: {}", request.getUsername());

            // Load user dari database
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

            // Generate JWT token
            String token = jwtService.generateToken(user);

            // Build user response
            UserResponse userResponse = new UserResponse();
            userResponse.setId(user.getId());
            userResponse.setUsername(user.getUsername());
            userResponse.setEmail(user.getEmail());
            userResponse.setRole(user.getRole());

            return new AuthResponse(token, userResponse);

        } catch (AuthenticationException e) {
            logger.warn("Authentication failed for user: {}", request.getUsername());
            throw new BadCredentialsException("Invalid username or password");
        }
    }
}
