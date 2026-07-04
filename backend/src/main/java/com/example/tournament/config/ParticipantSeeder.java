package com.example.tournament.config;

import com.example.tournament.entity.Participant;
import com.example.tournament.repository.ParticipantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * ParticipantSeeder
 *
 * Seeds the participants table with a default roster of gaming nicknames
 * on application startup.
 *
 * Idempotent: each nickname is checked via existsByName() before insertion.
 * Running the application multiple times will never create duplicates.
 *
 * Runs after DatabaseSeeder (@Order(2) vs DatabaseSeeder's default order).
 */
@Component
@Order(2)
public class ParticipantSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(ParticipantSeeder.class);

    private final ParticipantRepository participantRepository;

    public ParticipantSeeder(ParticipantRepository participantRepository) {
        this.participantRepository = participantRepository;
    }

    // ── Seed roster ───────────────────────────────────────────────────────────
    // 16 requested nicknames + 40 gaming-community nicknames = 56 total
    private static final List<String> NICKNAMES = List.of(
            // ── Requested nicknames ──────────────────────────────────────────
            "Meicheron",
            "Komiwa",
            "Lowki",
            "Nakatta",
            "BudakEliza",
            "Onikuhakku",
            "Cat",
            "PeceIlele",
            "Ketopak",
            "Apo",
            "Ewandy",
            "Rest",
            "Mila",
            "Naufy",
            "Akhy",
            "Nandaa",

            // ── Additional gaming nicknames ──────────────────────────────────
            "Raven",
            "Kuro",
            "Ryuzaki",
            "Kaizen",
            "Vanta",
            "Cipher",
            "Nova",
            "Spectre",
            "Phantom",
            "Ignis",
            "Volt",
            "Frost",
            "Drako",
            "Kitsune",
            "Astra",
            "Yoru",
            "Raijin",
            "Nezumi",
            "Hikari",
            "Kenshi",
            "Blitz",
            "Zero",
            "Zerox",
            "Noctis",
            "Aether",
            "Kage",
            "Sora",
            "Kitsu",
            "Lunatic",
            "Eclipse",
            "Vortex",
            "Reaper",
            "Havoc",
            "Falcon",
            "Crimson",
            "Tempest",
            "Shiro",
            "Mizuki",
            "Ronin",
            "Zenko",
            "Akairo"
    );

    @Override
    public void run(String... args) {
        seedParticipants();
    }

    private void seedParticipants() {
        int created = 0;
        int skipped = 0;

        for (String nickname : NICKNAMES) {
            if (participantRepository.existsByName(nickname)) {
                skipped++;
            } else {
                Participant participant = Participant.builder()
                        .name(nickname)
                        .build();
                participantRepository.save(participant);
                created++;
            }
        }

        if (created > 0) {
            logger.info("Participant seeder: {} participants created, {} already existed (skipped)",
                    created, skipped);
        } else {
            logger.info("Participant seeder: all {} participants already exist, skipping",
                    skipped);
        }
    }
}
