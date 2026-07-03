package com.example.tournament.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateTournamentRequest {

    @Size(max = 100, message = "Tournament name must not exceed 100 characters")
    private String name;

    @Size(max = 100, message = "Game must not exceed 100 characters")
    private String game;

    private String description;

    @Size(max = 100, message = "Host must not exceed 100 characters")
    private String host;

    @Min(value = 2, message = "Tournament must have at least 2 participants")
    private Integer maxParticipants;
}
