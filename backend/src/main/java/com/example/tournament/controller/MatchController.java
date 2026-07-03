package com.example.tournament.controller;

import com.example.tournament.dto.request.UpdateMatchScoreRequest;
import com.example.tournament.dto.response.ApiResponse;
import com.example.tournament.dto.response.MatchResponse;
import com.example.tournament.service.MatchService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    /**
     * GET /api/tournaments/{tournamentId}/matches
     * Get all matches for a tournament, ordered by round and match number.
     */
    @GetMapping("/api/tournaments/{tournamentId}/matches")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> getMatchesByTournament(
            @PathVariable Long tournamentId) {
        List<MatchResponse> matches = matchService.getMatchesByTournament(tournamentId);
        return ResponseEntity.ok(
                ApiResponse.success("Matches retrieved successfully", matches));
    }

    /**
     * GET /api/matches/{id}
     * Get a single match by ID.
     */
    @GetMapping("/api/matches/{id}")
    public ResponseEntity<ApiResponse<MatchResponse>> getMatchById(@PathVariable Long id) {
        MatchResponse match = matchService.getMatchById(id);
        return ResponseEntity.ok(
                ApiResponse.success("Match retrieved successfully", match));
    }

    /**
     * PUT /api/matches/{id}/score
     * Submit scores for a READY match.
     *
     * Rules:
     * - Match must be in READY status
     * - score1 and score2 must be >= 0
     * - Draws are not allowed (score1 != score2)
     * - Winner is determined automatically
     * - Winner advances to nextMatch automatically
     * - If nextMatch has both participants → nextMatch becomes READY
     * - If Final match is completed → Tournament status becomes FINISHED
     */
    @PutMapping("/api/matches/{id}/score")
    public ResponseEntity<ApiResponse<MatchResponse>> updateScore(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMatchScoreRequest request) {
        MatchResponse match = matchService.updateScore(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Score updated successfully", match));
    }
}
