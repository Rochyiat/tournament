package com.example.tournament.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TournamentParticipantResponse {

    private Long id;
    private Long tournamentId;
    private String tournamentName;
    private Long participantId;
    private String participantName;
    private LocalDateTime registeredAt;
}
