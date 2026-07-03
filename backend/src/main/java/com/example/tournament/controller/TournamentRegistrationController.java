package com.example.tournament.controller;

import com.example.tournament.dto.request.RegisterParticipantRequest;
import com.example.tournament.dto.response.ApiResponse;
import com.example.tournament.dto.response.RegistrationResponse;
import com.example.tournament.dto.response.TournamentParticipantResponse;
import com.example.tournament.service.TournamentRegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments/{tournamentId}/participants")
public class TournamentRegistrationController {

    private final TournamentRegistrationService registrationService;

    public TournamentRegistrationController(TournamentRegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    /**
     * GET /api/tournaments/{tournamentId}/participants
     * Get all registered participants for a tournament.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TournamentParticipantResponse>>> getRegisteredParticipants(
            @PathVariable Long tournamentId) {
        List<TournamentParticipantResponse> participants =
                registrationService.getRegisteredParticipants(tournamentId);
        return ResponseEntity.ok(
                ApiResponse.success("Registered participants retrieved successfully", participants));
    }

    /**
     * POST /api/tournaments/{tournamentId}/participants
     * Register a participant into a tournament.
     *
     * Rules enforced:
     * - Tournament must be in DRAFT status
     * - Participant cannot be registered twice
     * - Registration count cannot exceed maxParticipants
     * - Status auto-updates: DRAFT → READY when full
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RegistrationResponse>> registerParticipant(
            @PathVariable Long tournamentId,
            @Valid @RequestBody RegisterParticipantRequest request) {
        RegistrationResponse response = registrationService.registerParticipant(tournamentId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Participant registered successfully", response));
    }

    /**
     * DELETE /api/tournaments/{tournamentId}/participants/{participantId}
     * Unregister a participant from a tournament.
     *
     * Rules enforced:
     * - Tournament must be in DRAFT status
     * - Participant master data is NOT deleted, only the registration record
     * - Status auto-updates: READY → DRAFT if count drops below maxParticipants
     */
    @DeleteMapping("/{participantId}")
    public ResponseEntity<ApiResponse<Void>> unregisterParticipant(
            @PathVariable Long tournamentId,
            @PathVariable Long participantId) {
        registrationService.unregisterParticipant(tournamentId, participantId);
        return ResponseEntity.ok(
                ApiResponse.success("Participant unregistered successfully", null));
    }
}
