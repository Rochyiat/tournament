package com.example.tournament.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateMatchScoreRequest {

    @NotNull(message = "Score 1 is required")
    @Min(value = 0, message = "Score 1 must be 0 or greater")
    private Integer score1;

    @NotNull(message = "Score 2 is required")
    @Min(value = 0, message = "Score 2 must be 0 or greater")
    private Integer score2;
}
