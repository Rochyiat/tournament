package com.example.tournament.service;

import com.example.tournament.entity.Tournament;
import com.example.tournament.entity.User;
import com.example.tournament.enums.UserRole;
import com.example.tournament.exception.AccessForbiddenException;
import com.example.tournament.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * AuthorizationService
 *
 * Central helper for ownership and role-based access control.
 *
 * Rules:
 *  - ADMIN  → always allowed, regardless of tournament ownership.
 *  - USER   → only allowed if they are the tournament owner.
 *
 * Usage:
 *   authorizationService.checkOwnerOrAdmin(tournament);
 *
 * This keeps all authorization logic in one place so no service
 * duplicates the ownership check pattern.
 */
@Service
public class AuthorizationService {

    private final UserRepository userRepository;

    public AuthorizationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Returns the currently authenticated user from the SecurityContext.
     * Throws EntityNotFoundException if the user cannot be resolved.
     */
    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));
    }

    /**
     * Enforces that the caller is either:
     *   (a) an ADMIN, or
     *   (b) the owner of the given tournament.
     *
     * Throws AccessForbiddenException with a clear message if neither
     * condition is satisfied.
     */
    public void checkOwnerOrAdmin(Tournament tournament) {
        User currentUser = getCurrentUser();

        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;
        boolean isOwner = tournament.getOwner().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessForbiddenException(
                    "Access denied: you are not the owner of this tournament");
        }
    }
}
