-- ============================================================
-- Esport Tournament System - Database Schema
-- MySQL 8 Compatible
-- ============================================================

-- Disable foreign key checks temporarily for clean creation
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. users
-- ============================================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. tournaments
-- ============================================================
CREATE TABLE tournaments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    game VARCHAR(100) NOT NULL,
    description TEXT,
    host VARCHAR(100) NOT NULL,
    max_participants INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tournaments_created_by FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. participants
-- ============================================================
CREATE TABLE participants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. tournament_participants
-- ============================================================
CREATE TABLE tournament_participants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tournament_id BIGINT NOT NULL,
    participant_id BIGINT NOT NULL,
    registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tp_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_tp_participant FOREIGN KEY (participant_id) REFERENCES participants(id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT uq_tournament_participant UNIQUE (tournament_id, participant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. matches
-- ============================================================
CREATE TABLE matches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tournament_id BIGINT NOT NULL,
    round_number INT NOT NULL,
    match_number INT NOT NULL,
    participant1_id BIGINT,
    participant2_id BIGINT,
    score1 INT DEFAULT 0,
    score2 INT DEFAULT 0,
    winner_id BIGINT,
    next_match_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_matches_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_matches_participant1 FOREIGN KEY (participant1_id) REFERENCES tournament_participants(id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_matches_participant2 FOREIGN KEY (participant2_id) REFERENCES tournament_participants(id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_matches_winner FOREIGN KEY (winner_id) REFERENCES tournament_participants(id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_matches_next_match FOREIGN KEY (next_match_id) REFERENCES matches(id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Indexes
-- ============================================================

-- tournaments indexes
CREATE INDEX idx_tournaments_created_by ON tournaments(created_by);
CREATE INDEX idx_tournaments_status ON tournaments(status);

-- tournament_participants indexes
CREATE INDEX idx_tp_tournament ON tournament_participants(tournament_id);
CREATE INDEX idx_tp_participant ON tournament_participants(participant_id);

-- matches indexes
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_participant1 ON matches(participant1_id);
CREATE INDEX idx_matches_participant2 ON matches(participant2_id);
CREATE INDEX idx_matches_winner ON matches(winner_id);
CREATE INDEX idx_matches_next_match ON matches(next_match_id);
CREATE INDEX idx_matches_round ON matches(tournament_id, round_number);
