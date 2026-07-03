package com.example.tournament.dto.response;

import com.example.tournament.enums.TournamentStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TournamentResponse {

    private Long id;
    private String name;
    private String game;
    private String description;
    private String host;
    private Integer maxParticipants;
    private TournamentStatus status;
    private Long createdById;
    private String createdByUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
