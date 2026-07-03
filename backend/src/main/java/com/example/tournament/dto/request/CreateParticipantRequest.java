package com.example.tournament.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateParticipantRequest {

    @NotBlank(message = "Participant name is required")
    @Size(max = 100, message = "Participant name must not exceed 100 characters")
    private String name;
}
