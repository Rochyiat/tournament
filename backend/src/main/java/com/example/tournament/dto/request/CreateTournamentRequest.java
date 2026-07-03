package com.example.tournament.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateTournamentRequest {

    @NotBlank(message = "Tournament name is required")
    @Size(max = 100, message = "Tournament name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Game is required")
    @Size(max = 100, message = "Game must not exceed 100 characters")
    private String game;

    private String description;

    @NotBlank(message = "Host is required")
    @Size(max = 100, message = "Host must not exceed 100 characters")
    private String host;

    @NotNull(message = "Max participants is required")
    @Min(value = 2, message = "Tournament must have at least 2 participants")
    private Integer maxParticipants;
}
