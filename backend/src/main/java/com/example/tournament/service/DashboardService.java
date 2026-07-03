package com.example.tournament.service;

import com.example.tournament.dto.response.DashboardResponse;
import com.example.tournament.dto.response.StatusSummaryResponse;
import com.example.tournament.enums.TournamentStatus;
import com.example.tournament.repository.MatchRepository;
import com.example.tournament.repository.ParticipantRepository;
import com.example.tournament.repository.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final TournamentRepository tournamentRepository;
    private final ParticipantRepository participantRepository;
    private final MatchRepository matchRepository;

    public DashboardService(TournamentRepository tournamentRepository,
                              ParticipantRepository participantRepository,
                              MatchRepository matchRepository) {
        this.tournamentRepository = tournamentRepository;
        this.participantRepository = participantRepository;
        this.matchRepository = matchRepository;
    }

    /**
     * Aggregate dashboard summary.
     * Executes 6 lightweight COUNT queries — no entity loading.
     */
    @Transactional(readOnly = true)
    public DashboardResponse getDashboardSummary() {
        long totalTournaments = tournamentRepository.count();
        long totalParticipants = participantRepository.count();
        long totalMatches = matchRepository.count();

        StatusSummaryResponse statusSummary = new StatusSummaryResponse(
                tournamentRepository.countByStatus(TournamentStatus.DRAFT),
                tournamentRepository.countByStatus(TournamentStatus.READY),
                tournamentRepository.countByStatus(TournamentStatus.ONGOING),
                tournamentRepository.countByStatus(TournamentStatus.FINISHED)
        );

        return new DashboardResponse(totalTournaments, totalParticipants, totalMatches, statusSummary);
    }
}
