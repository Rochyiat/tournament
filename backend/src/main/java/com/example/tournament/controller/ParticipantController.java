package com.example.tournament.controller;

import com.example.tournament.dto.request.CreateParticipantRequest;
import com.example.tournament.dto.request.UpdateParticipantRequest;
import com.example.tournament.dto.response.ApiResponse;
import com.example.tournament.dto.response.ParticipantResponse;
import com.example.tournament.service.ParticipantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participants")
public class ParticipantController {

    private final ParticipantService participantService;

    public ParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    /**
     * GET /api/participants
     * Return all participants sorted by name ascending.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ParticipantResponse>>> getAll() {
        List<ParticipantResponse> participants = participantService.getAll();
        return ResponseEntity.ok(ApiResponse.success("Participants retrieved successfully", participants));
    }

    /**
     * GET /api/participants/{id}
     * Return participant by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ParticipantResponse>> getById(@PathVariable Long id) {
        ParticipantResponse participant = participantService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Participant retrieved successfully", participant));
    }

    /**
     * POST /api/participants
     * Create a new participant.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ParticipantResponse>> create(
            @Valid @RequestBody CreateParticipantRequest request) {
        ParticipantResponse participant = participantService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Participant created successfully", participant));
    }

    /**
     * PUT /api/participants/{id}
     * Update a participant's name.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ParticipantResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateParticipantRequest request) {
        ParticipantResponse participant = participantService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Participant updated successfully", participant));
    }

    /**
     * DELETE /api/participants/{id}
     * Delete a participant.
     * Returns HTTP 409 if participant is registered in any tournament.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        participantService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Participant deleted successfully", null));
    }
}
