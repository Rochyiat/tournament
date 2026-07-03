package com.example.tournament.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ParticipantResponse {

    private Long id;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
