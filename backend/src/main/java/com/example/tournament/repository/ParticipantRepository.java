package com.example.tournament.repository;

import com.example.tournament.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    List<Participant> findAllByOrderByNameAsc();

    boolean existsByName(String name);
}
