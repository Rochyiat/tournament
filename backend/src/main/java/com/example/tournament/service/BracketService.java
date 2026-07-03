package com.example.tournament.service;

import com.example.tournament.dto.response.BracketResponse;
import com.example.tournament.dto.response.MatchResponse;
import com.example.tournament.entity.Match;
import com.example.tournament.entity.Tournament;
import com.example.tournament.entity.TournamentParticipant;
import com.example.tournament.enums.MatchStatus;
import com.example.tournament.enums.TournamentStatus;
import com.example.tournament.exception.ConflictException;
import com.example.tournament.repository.MatchRepository;
import com.example.tournament.repository.TournamentParticipantRepository;
import com.example.tournament.repository.TournamentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BracketService {

    private static final Logger logger = LoggerFactory.getLogger(BracketService.class);

    private final TournamentRepository tournamentRepository;
    private final TournamentParticipantRepository tournamentParticipantRepository;
    private final MatchRepository matchRepository;

    public BracketService(TournamentRepository tournamentRepository,
                           TournamentParticipantRepository tournamentParticipantRepository,
                           MatchRepository matchRepository) {
        this.tournamentRepository = tournamentRepository;
        this.tournamentParticipantRepository = tournamentParticipantRepository;
        this.matchRepository = matchRepository;
    }

    // ─── GENERATE BRACKET ────────────────────────────────────────────────────

    @Transactional
    public void generateBracket(Long tournamentId) {
        Tournament tournament = findTournamentOrThrow(tournamentId);

        // Validation
        if (tournament.getStatus() != TournamentStatus.READY) {
            throw new ConflictException(
                    "Bracket can only be generated when tournament status is READY, current status: "
                    + tournament.getStatus());
        }

        if (matchRepository.existsByTournamentId(tournamentId)) {
            throw new ConflictException("Bracket has already been generated for this tournament");
        }

        List<TournamentParticipant> registrations =
                tournamentParticipantRepository.findAllByTournamentId(tournamentId);

        int participantCount = registrations.size();

        if (participantCount != tournament.getMaxParticipants()) {
            throw new ConflictException(
                    "Tournament is not full yet. Registered: " + participantCount
                    + ", Required: " + tournament.getMaxParticipants());
        }

        // Shuffle participants randomly
        List<TournamentParticipant> shuffled = shuffleParticipants(registrations);

        // Calculate total rounds for the smallest full bracket that fits all participants.
        int totalRounds = calculateRounds(participantCount);

        // Generate all rounds as unsaved Match objects, then link nextMatch
        List<Match> allMatches = buildAllMatches(tournament, shuffled, totalRounds);

        // Persist in order: later rounds first so nextMatch FK references are valid
        matchRepository.saveAll(allMatches);

        // Update tournament status to ONGOING
        tournament.setStatus(TournamentStatus.ONGOING);
        tournamentRepository.save(tournament);

        logger.info("Bracket generated: tournamentId={}, participants={}, rounds={}, matches={}",
                tournamentId, participantCount, totalRounds, allMatches.size());
    }

    // ─── GET BRACKET ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public BracketResponse getBracket(Long tournamentId) {
        Tournament tournament = findTournamentOrThrow(tournamentId);

        if (!matchRepository.existsByTournamentId(tournamentId)) {
            throw new EntityNotFoundException(
                    "Bracket has not been generated for tournament id: " + tournamentId);
        }

        List<Match> matches = matchRepository
                .findByTournamentIdOrderByRoundNumberAscMatchNumberAsc(tournamentId);

        // Group matches by round
        Map<Integer, List<MatchResponse>> rounds = matches.stream()
                .collect(Collectors.groupingBy(
                        Match::getRoundNumber,
                        LinkedHashMap::new,
                        Collectors.mapping(this::toMatchResponse, Collectors.toList())
                ));

        int totalRounds = rounds.size();
        int totalMatches = matches.size();

        return new BracketResponse(
                tournament.getId(),
                tournament.getName(),
                tournament.getStatus(),
                totalRounds,
                totalMatches,
                rounds
        );
    }

    // ─── ALGORITHM ────────────────────────────────────────────────────────────

    /**
     * Shuffle participants randomly for fair bracket seeding.
     */
    List<TournamentParticipant> shuffleParticipants(List<TournamentParticipant> participants) {
        List<TournamentParticipant> shuffled = new ArrayList<>(participants);
        Collections.shuffle(shuffled);
        return shuffled;
    }

    /**
     * Calculate total rounds for single elimination.
     * Formula: log2(participantCount)
     * Example: 8 participants → 3 rounds (QF, SF, Final)
     */
    int calculateRounds(int participantCount) {
        int rounds = 0;
        int bracketSize = 1;
        while (bracketSize < participantCount) {
            bracketSize <<= 1;
            rounds++;
        }
        return rounds;
    }

    /**
     * Build all Match objects for every round without persisting yet.
     *
     * Strategy:
     * 1. Build placeholder matches for all rounds (saved in a 2D list indexed by [round][matchIndex])
     * 2. Fill Round 1 with shuffled participants and apply byes when needed
     * 3. Advance bye winners into later rounds before persisting
     * 4. Link each Round N match's nextMatch → the corresponding Round N+1 match
     * 5. Flatten to a single list in round order for batch save
     */
    private List<Match> buildAllMatches(Tournament tournament,
                                        List<TournamentParticipant> shuffled,
                                        int totalRounds) {
        // allRounds[i] = list of matches for round (i+1)
        List<List<Match>> allRounds = new ArrayList<>();

        int bracketSize = 1 << totalRounds;
        int matchesInRound = bracketSize / 2;

        for (int round = 1; round <= totalRounds; round++) {
            List<Match> roundMatches = createRound(tournament, round, matchesInRound);
            allRounds.add(roundMatches);
            matchesInRound = matchesInRound / 2;
        }

        // Fill Round 1 with participants and byes.
        List<Match> round1 = allRounds.get(0);
        int remainingParticipants = shuffled.size();
        int participantIndex = 0;
        for (int i = 0; i < round1.size(); i++) {
            Match current = round1.get(i);
            int remainingMatches = round1.size() - i;
            boolean assignBye = remainingParticipants <= remainingMatches;

            if (assignBye) {
                current.setParticipant1(shuffled.get(participantIndex++));
                current.setParticipant2(null);
                current.setWinner(current.getParticipant1());
                current.setStatus(MatchStatus.FINISHED);
                remainingParticipants -= 1;
            } else {
                current.setParticipant1(shuffled.get(participantIndex++));
                current.setParticipant2(shuffled.get(participantIndex++));
                current.setStatus(MatchStatus.READY);
                remainingParticipants -= 2;
            }
        }

        // Link nextMatch: every 2 consecutive matches in round N feed into 1 match in round N+1
        for (int r = 0; r < totalRounds - 1; r++) {
            List<Match> currentRound = allRounds.get(r);
            List<Match> nextRound = allRounds.get(r + 1);

            for (int i = 0; i < currentRound.size(); i++) {
                Match nextMatch = nextRound.get(i / 2);
                currentRound.get(i).setNextMatch(nextMatch);
            }
        }

        // Propagate bye winners into later rounds before persisting.
        propagateByes(allRounds);

        // Flatten: save later rounds first so nextMatch foreign keys can be resolved.
        // Persist final round first, then work backwards.
        List<Match> ordered = new ArrayList<>();
        for (int r = totalRounds - 1; r >= 0; r--) {
            ordered.addAll(allRounds.get(r));
        }
        return ordered;
    }

    private void propagateByes(List<List<Match>> allRounds) {
        for (int round = 0; round < allRounds.size() - 1; round++) {
            for (Match match : allRounds.get(round)) {
                if (match.getStatus() != MatchStatus.FINISHED || match.getWinner() == null) {
                    continue;
                }

                Match nextMatch = match.getNextMatch();
                if (nextMatch == null) {
                    continue;
                }

                if (nextMatch.getParticipant1() == null) {
                    nextMatch.setParticipant1(match.getWinner());
                } else if (nextMatch.getParticipant2() == null) {
                    nextMatch.setParticipant2(match.getWinner());
                }

                if (nextMatch.getParticipant1() != null && nextMatch.getParticipant2() != null
                        && nextMatch.getStatus() == MatchStatus.PENDING) {
                    nextMatch.setStatus(MatchStatus.READY);
                }
            }
        }
    }

    /**
     * Create placeholder Match objects for a single round.
     * Participants and nextMatch are left null until filled by the caller.
     */
    List<Match> createRound(Tournament tournament, int roundNumber, int matchCount) {
        List<Match> matches = new ArrayList<>();
        for (int i = 1; i <= matchCount; i++) {
            matches.add(Match.builder()
                    .tournament(tournament)
                    .roundNumber(roundNumber)
                    .matchNumber(i)
                    .participant1(null)
                    .participant2(null)
                    .winner(null)
                    .score1(0)
                    .score2(0)
                    .status(MatchStatus.PENDING)
                    .build());
        }
        return matches;
    }

    /**
     * Check if n is a power of two.
     */
    private boolean isPowerOfTwo(int n) {
        return n >= 2 && (n & (n - 1)) == 0;
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    private Tournament findTournamentOrThrow(Long tournamentId) {
        return tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Tournament not found with id: " + tournamentId));
    }

    private MatchResponse toMatchResponse(Match m) {
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
