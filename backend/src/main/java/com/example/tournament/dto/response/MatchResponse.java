package com.example.tournament.dto.response;

import com.example.tournament.enums.MatchStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MatchResponse {

    private Long id;
    private Long tournamentId;
    private String tournamentName;
    private Integer roundNumber;
    private Integer matchNumber;
    private Long participant1Id;
    private String participant1Name;
    private Long participant2Id;
    private String participant2Name;
    private Integer score1;
    private Integer score2;
    private Long winnerId;
    private String winnerName;
    private Long nextMatchId;
    private MatchStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
