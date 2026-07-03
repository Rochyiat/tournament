package com.example.tournament.dto.response;

import com.example.tournament.enums.TournamentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponse {

    private Long registrationId;
    private Long tournamentId;
    private String tournamentName;
    private TournamentStatus tournamentStatus;
    private Long participantId;
    private String participantName;
    private int registeredCount;
    private int maxParticipants;
    private LocalDateTime registeredAt;
}
