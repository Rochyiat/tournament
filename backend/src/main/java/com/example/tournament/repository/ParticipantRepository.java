package com.example.tournament.repository;

import com.example.tournament.entity.Participant;
import com.example.tournament.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    /** All participants sorted by name — used by ADMIN. */
    List<Participant> findAllByOrderByNameAsc();

    /** Participants owned by a specific user, sorted by name — used by USER. */
    List<Participant> findByCreatedByOrderByNameAsc(User createdBy);

    /** Ownership-safe lookup: only returns the participant if it belongs to the given user. */
    Optional<Participant> findByIdAndCreatedBy(Long id, User createdBy);

    /** Idempotency check for the seeder. */
    boolean existsByName(String name);
}
