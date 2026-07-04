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

    /** ID of the user who owns this tournament. */
    private Long ownerId;

    /** Username of the user who owns this tournament. */
    private String ownerUsername;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
