# Esport Tournament System - ERD Diagram

## Mermaid ER Diagram

```mermaid
erDiagram
    users {
        BIGINT id PK
        VARCHAR username UK
        VARCHAR password
        VARCHAR role
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    tournaments {
        BIGINT id PK
        VARCHAR name
        VARCHAR game
        TEXT description
        VARCHAR host
        INT max_participants
        VARCHAR status
        BIGINT created_by FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    participants {
        BIGINT id PK
        VARCHAR name
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    tournament_participants {
        BIGINT id PK
        BIGINT tournament_id FK
        BIGINT participant_id FK
        TIMESTAMP registered_at
    }

    matches {
        BIGINT id PK
        BIGINT tournament_id FK
        INT round_number
        INT match_number
        BIGINT participant1_id FK
        BIGINT participant2_id FK
        INT score1
        INT score2
        BIGINT winner_id FK
        BIGINT next_match_id FK
        VARCHAR status
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    users ||--o{ tournaments : "creates"
    tournaments ||--o{ tournament_participants : "has"
    participants ||--o{ tournament_participants : "registers in"
    tournaments ||--o{ matches : "contains"
    tournament_participants ||--o{ matches : "plays as P1"
    tournament_participants ||--o{ matches : "plays as P2"
    tournament_participants ||--o{ matches : "wins"
    matches ||--o| matches : "advances to"
```

## Relationship Summary

| Relationship | Type | Description |
|-------------|------|-------------|
| users → tournaments | 1:N | A user can create multiple tournaments |
| tournaments → tournament_participants | 1:N | A tournament has multiple registered participants |
| participants → tournament_participants | 1:N | A participant can register in multiple tournaments |
| tournaments → matches | 1:N | A tournament has multiple matches |
| tournament_participants → matches (as P1) | 1:N | A participant can play as player 1 in multiple matches |
| tournament_participants → matches (as P2) | 1:N | A participant can play as player 2 in multiple matches |
| tournament_participants → matches (winner) | 1:N | A participant can win multiple matches |
| matches → matches (next_match) | 1:0..1 | A match can advance to at most one next match |
