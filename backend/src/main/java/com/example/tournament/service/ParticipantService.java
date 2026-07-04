package com.example.tournament.service;

import com.example.tournament.dto.request.CreateParticipantRequest;
import com.example.tournament.dto.request.UpdateParticipantRequest;
import com.example.tournament.dto.response.ParticipantResponse;
import com.example.tournament.entity.Participant;
import com.example.tournament.entity.User;
import com.example.tournament.enums.UserRole;
import com.example.tournament.exception.AccessForbiddenException;
import com.example.tournament.exception.ConflictException;
import com.example.tournament.repository.ParticipantRepository;
import com.example.tournament.repository.TournamentParticipantRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParticipantService {

    private static final Logger logger = LoggerFactory.getLogger(ParticipantService.class);

    private final ParticipantRepository participantRepository;
    private final TournamentParticipantRepository tournamentParticipantRepository;
    private final AuthorizationService authorizationService;

    public ParticipantService(ParticipantRepository participantRepository,
                               TournamentParticipantRepository tournamentParticipantRepository,
                               AuthorizationService authorizationService) {
        this.participantRepository = participantRepository;
        this.tournamentParticipantRepository = tournamentParticipantRepository;
        this.authorizationService = authorizationService;
    }

    // ─── CREATE ──────────────────────────────────────────────────────────────

    @Transactional
    public ParticipantResponse create(CreateParticipantRequest request) {
        User currentUser = authorizationService.getCurrentUser();

        Participant participant = Participant.builder()
                .name(request.getName())
                .createdBy(currentUser)
                .build();

        Participant saved = participantRepository.save(participant);
        logger.info("Participant created: id={}, name={}, by={}", saved.getId(), saved.getName(), currentUser.getUsername());

        return toResponse(saved);
    }

    // ─── READ ─────────────────────────────────────────────────────────────────

    /**
     * ADMIN → all participants.
     * USER  → only participants they created.
     */
    @Transactional(readOnly = true)
    public List<ParticipantResponse> getAll() {
        User currentUser = authorizationService.getCurrentUser();

        List<Participant> participants = isAdmin(currentUser)
                ? participantRepository.findAllByOrderByNameAsc()
                : participantRepository.findByCreatedByOrderByNameAsc(currentUser);

        return participants.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ParticipantResponse getById(Long id) {
        User currentUser = authorizationService.getCurrentUser();
        Participant participant = findByIdOrThrow(id);
        checkOwnerOrAdmin(participant, currentUser);
        return toResponse(participant);
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    @Transactional
    public ParticipantResponse update(Long id, UpdateParticipantRequest request) {
        User currentUser = authorizationService.getCurrentUser();
        Participant participant = findByIdOrThrow(id);
        checkOwnerOrAdmin(participant, currentUser);

        participant.setName(request.getName());
        Participant saved = participantRepository.save(participant);
        logger.info("Participant updated: id={}, name={}, by={}", saved.getId(), saved.getName(), currentUser.getUsername());

        return toResponse(saved);
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    @Transactional
    public void delete(Long id) {
        User currentUser = authorizationService.getCurrentUser();
        Participant participant = findByIdOrThrow(id);
        checkOwnerOrAdmin(participant, currentUser);

        if (tournamentParticipantRepository.existsByParticipantId(id)) {
            throw new ConflictException(
                    "Cannot delete participant that is registered in one or more tournaments");
        }

        participantRepository.delete(participant);
        logger.info("Participant deleted: id={}, by={}", id, currentUser.getUsername());
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    private Participant findByIdOrThrow(Long id) {
        return participantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Participant not found with id: " + id));
    }

    /**
     * Ownership check for participants.
     *
     * Rules:
     *  - ADMIN → always allowed.
     *  - USER  → allowed if they are the creator.
     *  - null createdBy (seeded rows) → ADMIN only.
     */
    private void checkOwnerOrAdmin(Participant participant, User currentUser) {
        if (isAdmin(currentUser)) return;

        if (participant.getCreatedBy() == null ||
                !participant.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessForbiddenException(
                    "Access denied: you are not the owner of this participant");
        }
    }

    private boolean isAdmin(User user) {
        return user.getRole() == UserRole.ADMIN;
    }

    ParticipantResponse toResponse(Participant p) {
        ParticipantResponse response = new ParticipantResponse();
        response.setId(p.getId());
        response.setName(p.getName());
        response.setCreatedAt(p.getCreatedAt());
        response.setUpdatedAt(p.getUpdatedAt());
        if (p.getCreatedBy() != null) {
            response.setCreatedById(p.getCreatedBy().getId());
            response.setCreatedByUsername(p.getCreatedBy().getUsername());
        }
        return response;
    }
}
