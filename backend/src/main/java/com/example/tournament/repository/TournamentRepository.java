package com.example.tournament.repository;

import com.example.tournament.entity.Tournament;
import com.example.tournament.entity.User;
import com.example.tournament.enums.TournamentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Long> {

    List<Tournament> findByCreatedBy(User createdBy);

    long countByStatus(TournamentStatus status);
}
