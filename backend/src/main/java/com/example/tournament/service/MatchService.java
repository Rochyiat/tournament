package com.example.tournament.service;

import com.example.tournament.dto.request.UpdateMatchScoreRequest;
import com.example.tournament.dto.response.MatchResponse;
import com.example.tournament.entity.Match;
import com.example.tournament.entity.Tournament;
import com.example.tournament.entity.TournamentParticipant;
import com.example.tournament.enums.MatchStatus;
import com.example.tournament.enums.TournamentStatus;
import com.example.tournament.exception.ConflictException;
import com.example.tournament.repository.MatchRepository;
import com.example.tournament.repository.TournamentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MatchService {

    private static final Logger logger = LoggerFactory.getLogger(MatchService.class);

    private final MatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;

    public MatchService(MatchRepository matchRepository,
                         TournamentRepository tournamentRepository) {
        this.matchRepository = matchRepository;
        this.tournamentRepository = tournamentRepository;
    }

    // ─── GET MATCHES ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<MatchResponse> getMatchesByTournament(Long tournamentId) {
        if (!tournamentRepository.existsById(tournamentId)) {
            throw new EntityNotFoundException("Tournament not found with id: " + tournamentId);
        }

        return matchRepository
                .findByTournamentIdOrderByRoundNumberAscMatchNumberAsc(tournamentId)
                .stream()
                .map(this::toMatchResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MatchResponse getMatchById(Long matchId) {
        return toMatchResponse(findMatchOrThrow(matchId));
    }

    // ─── UPDATE SCORE ─────────────────────────────────────────────────────────

    @Transactional
    public MatchResponse updateScore(Long matchId, UpdateMatchScoreRequest request) {
        Match match = findMatchOrThrow(matchId);

        // Validate match is in READY state
        if (match.getStatus() != MatchStatus.READY) {
            throw new ConflictException(
                    "Only READY matches can receive scores. Current status: " + match.getStatus());
        }

        // Validate tournament is still ongoing
        Tournament tournament = match.getTournament();
        if (tournament.getStatus() == TournamentStatus.FINISHED) {
            throw new ConflictException("Tournament is already finished");
        }

        // Validate no draw
        if (request.getScore1().equals(request.getScore2())) {
            throw new IllegalArgumentException("Draws are not allowed. Scores must be different");
        }

        // Set scores
        match.setScore1(request.getScore1());
        match.setScore2(request.getScore2());

        // Determine winner
        TournamentParticipant winner = determineWinner(match);
        match.setWinner(winner);
        match.setStatus(MatchStatus.FINISHED);

        Match saved = matchRepository.save(match);
        logger.info("Match score updated: matchId={}, score={}-{}, winner={}",
                matchId, request.getScore1(), request.getScore2(),
                winner.getParticipant().getName());

        // Advance winner to next match
        advanceWinner(saved);

        // Check tournament completion
        updateTournamentStatus(tournament);

        return toMatchResponse(matchRepository.findById(matchId)
                .orElseThrow(() -> new EntityNotFoundException("Match not found: " + matchId)));
    }

    // ─── DETERMINE WINNER ─────────────────────────────────────────────────────

    /**
     * Determine winner based on scores.
     * Higher score wins. Draws are rejected before this method is called.
     */
    TournamentParticipant determineWinner(Match match) {
        if (match.getScore1() > match.getScore2()) {
            return match.getParticipant1();
        } else {
            return match.getParticipant2();
        }
    }

    // ─── ADVANCE WINNER ───────────────────────────────────────────────────────

    /**
     * Place winner into the correct slot of the next match.
     *
     * Logic:
     * - If this match has no nextMatch → it is the Final, skip advancement
     * - If nextMatch.participant1 is null → winner becomes participant1
     * - Else → winner becomes participant2
     * - If nextMatch now has both participants → set nextMatch.status = READY
     */
    void advanceWinner(Match completedMatch) {
        Match nextMatch = completedMatch.getNextMatch();

        if (nextMatch == null) {
            // This is the Final match — no advancement needed
            logger.info("Final match completed: matchId={}, champion={}",
                    completedMatch.getId(),
                    completedMatch.getWinner().getParticipant().getName());
            return;
        }

        // Place winner into empty slot
        if (nextMatch.getParticipant1() == null) {
            nextMatch.setParticipant1(completedMatch.getWinner());
        } else {
            nextMatch.setParticipant2(completedMatch.getWinner());
        }

        // Activate next match when both slots are filled
        if (nextMatch.getParticipant1() != null && nextMatch.getParticipant2() != null) {
            nextMatch.setStatus(MatchStatus.READY);
            logger.info("Next match is now READY: matchId={}, round={}, match={}",
                    nextMatch.getId(), nextMatch.getRoundNumber(), nextMatch.getMatchNumber());
        }

        matchRepository.save(nextMatch);
    }

    // ─── TOURNAMENT STATUS ────────────────────────────────────────────────────

    /**
     * Check if all matches are FINISHED.
     * If so, mark tournament as FINISHED.
     *
     * Uses countByTournamentIdAndStatusNot to find any match not yet FINISHED.
     * If count == 0, all matches are done → tournament is FINISHED.
     */
    void updateTournamentStatus(Tournament tournament) {
        long unfinishedCount = matchRepository.countByTournamentIdAndStatusNot(
                tournament.getId(), MatchStatus.FINISHED);

        if (unfinishedCount == 0) {
            tournament.setStatus(TournamentStatus.FINISHED);
            tournamentRepository.save(tournament);
            logger.info("Tournament FINISHED: id={}, name={}", tournament.getId(), tournament.getName());
        }
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    private Match findMatchOrThrow(Long matchId) {
        return matchRepository.findById(matchId)
                .orElseThrow(() -> new EntityNotFoundException("Match not found with id: " + matchId));
    }

    MatchResponse toMatchResponse(Match m) {
        MatchResponse r = new MatchResponse();
        r.setId(m.getId());
        r.setTournamentId(m.getTournament().getId());
        r.setTournamentName(m.getTournament().getName());
        r.setRoundNumber(m.getRoundNumber());
        r.setMatchNumber(m.getMatchNumber());
        r.setScore1(m.getScore1());
        r.setScore2(m.getScore2());
        r.setStatus(m.getStatus());
        r.setCreatedAt(m.getCreatedAt());
        r.setUpdatedAt(m.getUpdatedAt());

        if (m.getParticipant1() != null) {
            r.setParticipant1Id(m.getParticipant1().getId());
            r.setParticipant1Name(m.getParticipant1().getParticipant().getName());
        }
        if (m.getParticipant2() != null) {
            r.setParticipant2Id(m.getParticipant2().getId());
            r.setParticipant2Name(m.getParticipant2().getParticipant().getName());
        }
        if (m.getWinner() != null) {
            r.setWinnerId(m.getWinner().getId());
            r.setWinnerName(m.getWinner().getParticipant().getName());
        }
        if (m.getNextMatch() != null) {
            r.setNextMatchId(m.getNextMatch().getId());
        }

        return r;
    }
}
