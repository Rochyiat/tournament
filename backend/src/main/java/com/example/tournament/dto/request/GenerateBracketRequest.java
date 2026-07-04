package com.example.tournament.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Optional request body for POST /api/tournaments/{id}/generate-bracket.
 *
 * When this body is absent (null) or seedingType is null/RANDOM,
 * the existing random shuffle algorithm is used unchanged.
 *
 * When seedingType is CUSTOM, participantIds must be provided in the
 * exact order the organizer wants. The service will use that order
 * directly instead of shuffling.
 */
@Data
@NoArgsConstructor
public class GenerateBracketRequest {

    /**
     * "RANDOM" (default) or "CUSTOM".
     * Null is treated as "RANDOM" — fully backward-compatible.
     */
    private String seedingType;

    /**
     * Ordered list of participant IDs for CUSTOM seeding.
     * Must contain exactly the registered participant IDs for this tournament.
     * Ignored when seedingType is RANDOM or null.
     */
    private List<Long> participantIds;
}
