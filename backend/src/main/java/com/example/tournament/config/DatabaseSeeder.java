package com.example.tournament.config;

import com.example.tournament.entity.User;
import com.example.tournament.enums.UserRole;
import com.example.tournament.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdminUser();
    }

    private void seedAdminUser() {
        // Buat admin hanya jika belum ada
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("Admin123!"))
                    .role(UserRole.ADMIN)
                    .build();

            userRepository.save(admin);
            logger.info("Admin user created successfully");
        } else {
            logger.info("Admin user already exists, skipping seed");
        }
    }
}
