package com.example.tournament.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private long totalTournaments;
    private long totalParticipants;
    private long totalMatches;
    private StatusSummaryResponse statusSummary;
}
