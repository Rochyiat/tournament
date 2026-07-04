package com.example.tournament.controller;

import com.example.tournament.dto.request.GenerateBracketRequest;
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
     * The request body is optional and fully backward-compatible:
     * - If body is absent, null, or seedingType is RANDOM → random shuffle (original behaviour)
     * - If seedingType is CUSTOM and participantIds provided → use that order directly
     *
     * Requirements:
     * - Tournament status must be READY
     * - Participant count must equal maxParticipants
     * - Bracket has not been generated yet
     */
    @PostMapping("/generate-bracket")
    public ResponseEntity<ApiResponse<Void>> generateBracket(
            @PathVariable Long tournamentId,
            @RequestBody(required = false) GenerateBracketRequest request) {
        bracketService.generateBracket(tournamentId, request);
        return ResponseEntity.ok(
                ApiResponse.success("Bracket generated successfully", null));
    }

    /**
     * GET /api/tournaments/{tournamentId}/bracket
     *
     * Retrieve the bracket structure for a tournament.
     * Returns matches grouped by round number, plus the seedingType used.
     */
    @GetMapping("/bracket")
    public ResponseEntity<ApiResponse<BracketResponse>> getBracket(@PathVariable Long tournamentId) {
        BracketResponse bracket = bracketService.getBracket(tournamentId);
        return ResponseEntity.ok(
                ApiResponse.success("Bracket retrieved successfully", bracket));
    }
}
