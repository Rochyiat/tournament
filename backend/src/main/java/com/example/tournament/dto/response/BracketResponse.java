package com.example.tournament.dto.response;

import com.example.tournament.enums.TournamentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BracketResponse {

    private Long tournamentId;
    private String tournamentName;
    private TournamentStatus tournamentStatus;
    private int totalRounds;
    private int totalMatches;

    /**
     * Matches grouped by round number.
     * Key = round number (1 = first round, totalRounds = final)
     * Value = list of matches in that round
     */
    private Map<Integer, List<MatchResponse>> rounds;
}
