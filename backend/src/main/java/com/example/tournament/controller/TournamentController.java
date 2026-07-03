package com.example.tournament.controller;

import com.example.tournament.dto.request.CreateTournamentRequest;
import com.example.tournament.dto.request.UpdateTournamentRequest;
import com.example.tournament.dto.response.ApiResponse;
import com.example.tournament.dto.response.TournamentResponse;
import com.example.tournament.service.TournamentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {

    private static final Logger logger = LoggerFactory.getLogger(TournamentController.class);

    private final TournamentService tournamentService;

    public TournamentController(TournamentService tournamentService) {
        this.tournamentService = tournamentService;
    }

    /**
     * GET /api/tournaments
     * Get all tournaments.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TournamentResponse>>> getAll() {
        List<TournamentResponse> tournaments = tournamentService.getAll();
        return ResponseEntity.ok(ApiResponse.success("Tournaments retrieved successfully", tournaments));
    }

    /**
     * GET /api/tournaments/{id}
     * Get tournament by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TournamentResponse>> getById(@PathVariable Long id) {
        TournamentResponse tournament = tournamentService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Tournament retrieved successfully", tournament));
    }

    /**
     * GET /api/tournaments/my
     * Get tournaments owned by the current authenticated user.
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<TournamentResponse>>> getMyTournaments() {
        List<TournamentResponse> tournaments = tournamentService.getMyTournaments();
        return ResponseEntity.ok(ApiResponse.success("My tournaments retrieved successfully", tournaments));
    }

    /**
     * POST /api/tournaments
     * Create a new tournament. Status defaults to DRAFT.
     * createdBy is taken from the JWT — never from the request body.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TournamentResponse>> create(
            @Valid @RequestBody CreateTournamentRequest request) {
        TournamentResponse tournament = tournamentService.create(request);
        logger.info("Tournament created: id={}", tournament.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tournament created successfully", tournament));
    }

    /**
     * PUT /api/tournaments/{id}
     * Update a tournament. Only owner can update. Only DRAFT status allowed.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TournamentResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTournamentRequest request) {
        TournamentResponse tournament = tournamentService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Tournament updated successfully", tournament));
    }

    /**
     * DELETE /api/tournaments/{id}
     * Delete a tournament. Only owner can delete. Only DRAFT status allowed.
     * Cannot delete if tournament already has participants.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        tournamentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Tournament deleted successfully", null));
    }
}
