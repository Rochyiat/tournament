package com.example.tournament.service;

import com.example.tournament.dto.request.CreateTournamentRequest;
import com.example.tournament.dto.request.UpdateTournamentRequest;
import com.example.tournament.dto.response.TournamentResponse;
import com.example.tournament.entity.Tournament;
import com.example.tournament.entity.User;
import com.example.tournament.enums.TournamentStatus;
import com.example.tournament.repository.TournamentParticipantRepository;
import com.example.tournament.repository.TournamentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TournamentService {

    private static final Logger logger = LoggerFactory.getLogger(TournamentService.class);

    private final TournamentRepository tournamentRepository;
    private final TournamentParticipantRepository participantRepository;
    private final AuthorizationService authorizationService;

    public TournamentService(TournamentRepository tournamentRepository,
                              TournamentParticipantRepository participantRepository,
                              AuthorizationService authorizationService) {
        this.tournamentRepository = tournamentRepository;
        this.participantRepository = participantRepository;
        this.authorizationService = authorizationService;
    }

    // ─── CREATE ──────────────────────────────────────────────────────────────

    @Transactional
    public TournamentResponse create(CreateTournamentRequest request) {
        User currentUser = authorizationService.getCurrentUser();

        Tournament tournament = Tournament.builder()
                .name(request.getName())
                .game(request.getGame())
                .description(request.getDescription())
                .host(request.getHost())
                .maxParticipants(request.getMaxParticipants())
                .status(TournamentStatus.DRAFT)
                .owner(currentUser)
                .build();

        Tournament saved = tournamentRepository.save(tournament);
        logger.info("Tournament created: id={}, name={}, by={}", saved.getId(), saved.getName(), currentUser.getUsername());

        return toResponse(saved);
    }

    // ─── READ ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TournamentResponse> getAll() {
        return tournamentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TournamentResponse getById(Long id) {
        Tournament tournament = findByIdOrThrow(id);
        return toResponse(tournament);
    }

    @Transactional(readOnly = true)
    public List<TournamentResponse> getMyTournaments() {
        User currentUser = authorizationService.getCurrentUser();
        return tournamentRepository.findByOwner(currentUser)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    @Transactional
    public TournamentResponse update(Long id, UpdateTournamentRequest request) {
        Tournament tournament = findByIdOrThrow(id);

        // Only owner or admin can update
        authorizationService.checkOwnerOrAdmin(tournament);
        checkIsDraft(tournament, "update");

        if (request.getName() != null)            tournament.setName(request.getName());
        if (request.getGame() != null)            tournament.setGame(request.getGame());
        if (request.getDescription() != null)     tournament.setDescription(request.getDescription());
        if (request.getHost() != null)            tournament.setHost(request.getHost());
        if (request.getMaxParticipants() != null) tournament.setMaxParticipants(request.getMaxParticipants());

        Tournament saved = tournamentRepository.save(tournament);
        logger.info("Tournament updated: id={}, by={}", id, authorizationService.getCurrentUser().getUsername());

        return toResponse(saved);
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    @Transactional
    public void delete(Long id) {
        Tournament tournament = findByIdOrThrow(id);

        // Only owner or admin can delete
        authorizationService.checkOwnerOrAdmin(tournament);
        checkIsDraft(tournament, "delete");

        if (participantRepository.existsByTournamentId(id)) {
            throw new IllegalArgumentException(
                    "Cannot delete tournament with registered participants");
        }

        tournamentRepository.delete(tournament);
        logger.info("Tournament deleted: id={}", id);
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    Tournament findByIdOrThrow(Long id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Tournament not found with id: " + id));
    }

    private void checkIsDraft(Tournament tournament, String action) {
        if (tournament.getStatus() != TournamentStatus.DRAFT) {
            throw new IllegalArgumentException(
                    "Cannot " + action + " tournament with status: " + tournament.getStatus());
        }
    }

    TournamentResponse toResponse(Tournament t) {
        TournamentResponse response = new TournamentResponse();
        response.setId(t.getId());
        response.setName(t.getName());
        response.setGame(t.getGame());
        response.setDescription(t.getDescription());
        response.setHost(t.getHost());
        response.setMaxParticipants(t.getMaxParticipants());
        response.setStatus(t.getStatus());
        response.setOwnerId(t.getOwner().getId());
        response.setOwnerUsername(t.getOwner().getUsername());
        response.setCreatedAt(t.getCreatedAt());
        response.setUpdatedAt(t.getUpdatedAt());
        return response;
    }
}
