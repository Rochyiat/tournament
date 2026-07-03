package com.example.tournament.service;

import com.example.tournament.dto.request.CreateParticipantRequest;
import com.example.tournament.dto.request.UpdateParticipantRequest;
import com.example.tournament.dto.response.ParticipantResponse;
import com.example.tournament.entity.Participant;
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

    public ParticipantService(ParticipantRepository participantRepository,
                               TournamentParticipantRepository tournamentParticipantRepository) {
        this.participantRepository = participantRepository;
        this.tournamentParticipantRepository = tournamentParticipantRepository;
    }

    // ─── CREATE ──────────────────────────────────────────────────────────────

    @Transactional
    public ParticipantResponse create(CreateParticipantRequest request) {
        Participant participant = Participant.builder()
                .name(request.getName())
                .build();

        Participant saved = participantRepository.save(participant);
        logger.info("Participant created: id={}, name={}", saved.getId(), saved.getName());

        return toResponse(saved);
    }

    // ─── READ ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ParticipantResponse> getAll() {
        return participantRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ParticipantResponse getById(Long id) {
        return toResponse(findByIdOrThrow(id));
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    @Transactional
    public ParticipantResponse update(Long id, UpdateParticipantRequest request) {
        Participant participant = findByIdOrThrow(id);
        participant.setName(request.getName());

        Participant saved = participantRepository.save(participant);
        logger.info("Participant updated: id={}, name={}", saved.getId(), saved.getName());

        return toResponse(saved);
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    @Transactional
    public void delete(Long id) {
        Participant participant = findByIdOrThrow(id);

        if (tournamentParticipantRepository.existsByParticipantId(id)) {
            throw new ConflictException(
                    "Cannot delete participant that is registered in one or more tournaments");
        }

        participantRepository.delete(participant);
        logger.info("Participant deleted: id={}", id);
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    private Participant findByIdOrThrow(Long id) {
        return participantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Participant not found with id: " + id));
    }

    private ParticipantResponse toResponse(Participant p) {
        ParticipantResponse response = new ParticipantResponse();
        response.setId(p.getId());
        response.setName(p.getName());
        response.setCreatedAt(p.getCreatedAt());
        response.setUpdatedAt(p.getUpdatedAt());
        return response;
    }
}
