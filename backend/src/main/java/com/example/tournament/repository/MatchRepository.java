package com.example.tournament.repository;

import com.example.tournament.entity.Match;
import com.example.tournament.enums.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    boolean existsByTournamentId(Long tournamentId);

    List<Match> findByTournamentIdOrderByRoundNumberAscMatchNumberAsc(Long tournamentId);

    long countByTournamentId(Long tournamentId);

    long countByTournamentIdAndStatusNot(Long tournamentId, MatchStatus status);
}
