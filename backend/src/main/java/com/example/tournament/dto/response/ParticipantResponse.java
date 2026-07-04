package com.example.tournament.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ParticipantResponse {

    private Long id;
    private String name;

    /** ID of the user who owns this participant. Null for seeded/system participants. */
    private Long createdById;

    /** Username of the owner. Null for seeded/system participants. */
    private String createdByUsername;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
