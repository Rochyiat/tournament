package com.example.tournament.repository;

import com.example.tournament.entity.TournamentParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentParticipantRepository extends JpaRepository<TournamentParticipant, Long> {

    boolean existsByTournamentId(Long tournamentId);

    boolean existsByParticipantId(Long participantId);

    boolean existsByTournamentIdAndParticipantId(Long tournamentId, Long participantId);

    long countByTournamentId(Long tournamentId);

    List<TournamentParticipant> findAllByTournamentId(Long tournamentId);

    void deleteByTournamentIdAndParticipantId(Long tournamentId, Long participantId);
}
