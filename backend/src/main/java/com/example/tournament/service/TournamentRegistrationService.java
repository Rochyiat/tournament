package com.example.tournament.service;

import com.example.tournament.dto.request.RegisterParticipantRequest;
import com.example.tournament.dto.response.RegistrationResponse;
import com.example.tournament.dto.response.TournamentParticipantResponse;
import com.example.tournament.entity.Participant;
import com.example.tournament.entity.Tournament;
import com.example.tournament.entity.TournamentParticipant;
import com.example.tournament.enums.TournamentStatus;
import com.example.tournament.exception.ConflictException;
import com.example.tournament.repository.ParticipantRepository;
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
public class TournamentRegistrationService {

    private static final Logger logger = LoggerFactory.getLogger(TournamentRegistrationService.class);

    private final TournamentRepository tournamentRepository;
    private final ParticipantRepository participantRepository;
    private final TournamentParticipantRepository tournamentParticipantRepository;
    private final AuthorizationService authorizationService;

    public TournamentRegistrationService(TournamentRepository tournamentRepository,
                                          ParticipantRepository participantRepository,
                                          TournamentParticipantRepository tournamentParticipantRepository,
                                          AuthorizationService authorizationService) {
        this.tournamentRepository = tournamentRepository;
        this.participantRepository = participantRepository;
        this.tournamentParticipantRepository = tournamentParticipantRepository;
        this.authorizationService = authorizationService;
    }

    // ─── REGISTER ─────────────────────────────────────────────────────────────

    @Transactional
    public RegistrationResponse registerParticipant(Long tournamentId, RegisterParticipantRequest request) {
        Tournament tournament = findTournamentOrThrow(tournamentId);
        Participant participant = findParticipantOrThrow(request.getParticipantId());

        // Ownership check: only owner or admin can register participants
        authorizationService.checkOwnerOrAdmin(tournament);

        // Business rules
        checkTournamentIsDraft(tournament);
        checkNotAlreadyRegistered(tournamentId, request.getParticipantId());
        checkTournamentNotFull(tournament);

        TournamentParticipant registration = TournamentParticipant.builder()
                .tournament(tournament)
                .participant(participant)
                .build();

        TournamentParticipant saved = tournamentParticipantRepository.save(registration);

        updateTournamentStatus(tournament);

        logger.info("Participant registered: tournamentId={}, participantId={}", tournamentId, request.getParticipantId());

        return toRegistrationResponse(saved);
    }

    // ─── UNREGISTER ───────────────────────────────────────────────────────────

    @Transactional
    public void unregisterParticipant(Long tournamentId, Long participantId) {
        Tournament tournament = findTournamentOrThrow(tournamentId);
        findParticipantOrThrow(participantId);

        // Ownership check: only owner or admin can unregister participants
        authorizationService.checkOwnerOrAdmin(tournament);

        checkTournamentIsDraft(tournament);

        if (!tournamentParticipantRepository.existsByTournamentIdAndParticipantId(tournamentId, participantId)) {
            throw new EntityNotFoundException("Participant is not registered in this tournament");
        }

        tournamentParticipantRepository.deleteByTournamentIdAndParticipantId(tournamentId, participantId);

        updateTournamentStatus(tournament);

        logger.info("Participant unregistered: tournamentId={}, participantId={}", tournamentId, participantId);
    }

    // ─── GET PARTICIPANTS ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TournamentParticipantResponse> getRegisteredParticipants(Long tournamentId) {
        findTournamentOrThrow(tournamentId);

        return tournamentParticipantRepository.findAllByTournamentId(tournamentId)
                .stream()
                .map(this::toTournamentParticipantResponse)
                .collect(Collectors.toList());
    }

    // ─── COUNT PARTICIPANTS ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public long countRegisteredParticipants(Long tournamentId) {
        findTournamentOrThrow(tournamentId);
        return tournamentParticipantRepository.countByTournamentId(tournamentId);
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    private Tournament findTournamentOrThrow(Long tournamentId) {
        return tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new EntityNotFoundException("Tournament not found with id: " + tournamentId));
    }

    private Participant findParticipantOrThrow(Long participantId) {
        return participantRepository.findById(participantId)
                .orElseThrow(() -> new EntityNotFoundException("Participant not found with id: " + participantId));
    }

    private void checkTournamentIsDraft(Tournament tournament) {
        if (tournament.getStatus() != TournamentStatus.DRAFT) {
            throw new ConflictException("Tournament is not editable with status: " + tournament.getStatus());
        }
    }

    private void checkNotAlreadyRegistered(Long tournamentId, Long participantId) {
        if (tournamentParticipantRepository.existsByTournamentIdAndParticipantId(tournamentId, participantId)) {
            throw new ConflictException("Participant is already registered in this tournament");
        }
    }

    private void checkTournamentNotFull(Tournament tournament) {
        long registeredCount = tournamentParticipantRepository.countByTournamentId(tournament.getId());
        if (registeredCount >= tournament.getMaxParticipants()) {
            throw new ConflictException("Tournament is full");
        }
    }

    private void updateTournamentStatus(Tournament tournament) {
        long registeredCount = tournamentParticipantRepository.countByTournamentId(tournament.getId());

        TournamentStatus newStatus = registeredCount >= tournament.getMaxParticipants()
                ? TournamentStatus.READY
                : TournamentStatus.DRAFT;

        if (tournament.getStatus() != newStatus) {
            tournament.setStatus(newStatus);
            tournamentRepository.save(tournament);
            logger.info("Tournament status updated: id={}, status={}", tournament.getId(), newStatus);
        }
    }

    private RegistrationResponse toRegistrationResponse(TournamentParticipant tp) {
        long registeredCount = tournamentParticipantRepository.countByTournamentId(tp.getTournament().getId());

        return new RegistrationResponse(
                tp.getId(),
                tp.getTournament().getId(),
                tp.getTournament().getName(),
                tp.getTournament().getStatus(),
                tp.getParticipant().getId(),
                tp.getParticipant().getName(),
                (int) registeredCount,
                tp.getTournament().getMaxParticipants(),
                tp.getRegisteredAt()
        );
    }

    private TournamentParticipantResponse toTournamentParticipantResponse(TournamentParticipant tp) {
        TournamentParticipantResponse response = new TournamentParticipantResponse();
        response.setId(tp.getId());
        response.setTournamentId(tp.getTournament().getId());
        response.setTournamentName(tp.getTournament().getName());
        response.setParticipantId(tp.getParticipant().getId());
        response.setParticipantName(tp.getParticipant().getName());
        response.setRegisteredAt(tp.getRegisteredAt());
        return response;
    }
}
