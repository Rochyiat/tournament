package com.example.tournament.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusSummaryResponse {

    private long draft;
    private long ready;
    private long ongoing;
    private long finished;
}
