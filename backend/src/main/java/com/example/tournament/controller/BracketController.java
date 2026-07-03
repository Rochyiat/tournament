package com.example.tournament.controller;

import com.example.tournament.dto.response.ApiResponse;
import com.example.tournament.dto.response.BracketResponse;
import com.example.tournament.service.BracketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tournaments/{tournamentId}")
public class BracketController {

    private final BracketService bracketService;

    public BracketController(BracketService bracketService) {
        this.bracketService = bracketService;
    }

    /**
     * POST /api/tournaments/{tournamentId}/generate-bracket
     *
     * Generate single elimination bracket for a tournament.
     *
     * Requirements:
     * - Tournament status must be READY
     * - Participant count must equal maxParticipants
     * - Participant count must be a power of 2 (2, 4, 8, 16, 32)
     * - Bracket has not been generated yet
     *
     * Algorithm:
     * 1. Shuffle participants randomly
     * 2. Create matches for all rounds (Round 1 filled, others PENDING)
     * 3. Link nextMatch pointers
     * 4. Update tournament status to ONGOING
     */
    @PostMapping("/generate-bracket")
    public ResponseEntity<ApiResponse<Void>> generateBracket(@PathVariable Long tournamentId) {
        bracketService.generateBracket(tournamentId);
        return ResponseEntity.ok(
                ApiResponse.success("Bracket generated successfully", null));
    }

    /**
     * GET /api/tournaments/{tournamentId}/bracket
     *
     * Retrieve the bracket structure for a tournament.
     * Returns matches grouped by round number.
     */
    @GetMapping("/bracket")
    public ResponseEntity<ApiResponse<BracketResponse>> getBracket(@PathVariable Long tournamentId) {
        BracketResponse bracket = bracketService.getBracket(tournamentId);
        return ResponseEntity.ok(
                ApiResponse.success("Bracket retrieved successfully", bracket));
    }
}
