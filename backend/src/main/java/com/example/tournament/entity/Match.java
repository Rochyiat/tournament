package com.example.tournament.entity;

import com.example.tournament.enums.MatchStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "matches",
    indexes = {
        @Index(name = "idx_matches_tournament", columnList = "tournament_id"),
        @Index(name = "idx_matches_participant1", columnList = "participant1_id"),
        @Index(name = "idx_matches_participant2", columnList = "participant2_id"),
        @Index(name = "idx_matches_winner", columnList = "winner_id"),
        @Index(name = "idx_matches_next_match", columnList = "next_match_id"),
        @Index(name = "idx_matches_round", columnList = "tournament_id, round_number")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @Column(nullable = false)
    private Integer roundNumber;

    @Column(nullable = false)
    private Integer matchNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant1_id")
    private TournamentParticipant participant1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant2_id")
    private TournamentParticipant participant2;

    @Column(columnDefinition = "INT DEFAULT 0")
    @Builder.Default
    private Integer score1 = 0;

    @Column(columnDefinition = "INT DEFAULT 0")
    @Builder.Default
    private Integer score2 = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    private TournamentParticipant winner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "next_match_id")
    private Match nextMatch;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MatchStatus status = MatchStatus.PENDING;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
