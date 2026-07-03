package com.example.tournament.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterParticipantRequest {

    @NotNull(message = "Participant ID is required")
    private Long participantId;
}
