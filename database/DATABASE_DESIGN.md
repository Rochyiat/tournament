# Esport Tournament System - Database Design Documentation

## 1. Table Explanations

### 1.1 users

Stores user accounts for authentication and authorization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Login username |
| password | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'USER' | User role (USER, ADMIN) |
| created_at | TIMESTAMP | NOT NULL | Account creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

### 1.2 tournaments

Stores tournament information and configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Tournament name |
| game | VARCHAR(100) | NOT NULL | Game being played |
| description | TEXT | NULLABLE | Tournament description |
| host | VARCHAR(100) | NOT NULL | Host organization/person |
| max_participants | INT | NOT NULL | Maximum allowed participants |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'DRAFT' | Tournament status |
| created_by | BIGINT | FK → users.id, NOT NULL | Creator reference |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Status Values:**
- `DRAFT` - Tournament is being set up
- `READY` - Registration open, bracket not started
- `ONGOING` - Matches in progress
- `FINISHED` - Tournament completed

### 1.3 participants

Stores participant information (separate from users).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Participant/team name |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

### 1.4 tournament_participants

Junction table linking tournaments and participants (many-to-many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| tournament_id | BIGINT | FK → tournaments.id, NOT NULL | Tournament reference |
| participant_id | BIGINT | FK → participants.id, NOT NULL | Participant reference |
| registered_at | TIMESTAMP | NOT NULL | Registration time |

**Constraints:**
- UNIQUE(tournament_id, participant_id) - Prevents duplicate registrations

### 1.5 matches

Stores match information for single elimination bracket.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| tournament_id | BIGINT | FK → tournaments.id, NOT NULL | Tournament reference |
| round_number | INT | NOT NULL | Round number (1 = first round) |
| match_number | INT | NOT NULL | Position within round |
| participant1_id | BIGINT | FK → tournament_participants.id, NULLABLE | First player |
| participant2_id | BIGINT | FK → tournament_participants.id, NULLABLE | Second player |
| score1 | INT | DEFAULT 0 | Participant1 score |
| score2 | INT | DEFAULT 0 | Participant2 score |
| winner_id | BIGINT | FK → tournament_participants.id, NULLABLE | Match winner |
| next_match_id | BIGINT | FK → matches.id, NULLABLE | Next round match |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | Match status |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Status Values:**
- `PENDING` - Match waiting for participants
- `READY` - Both participants assigned
- `FINISHED` - Match completed with winner

---

## 2. Relationship Explanations

### 2.1 users → tournaments (1:N)

- A user can create multiple tournaments
- Each tournament is created by exactly one user
- Foreign Key: `tournaments.created_by` → `users.id`
- On Delete: RESTRICT (cannot delete user with tournaments)

### 2.2 tournaments → tournament_participants (1:N)

- A tournament can have multiple registered participants
- Each registration belongs to exactly one tournament
- Foreign Key: `tournament_participants.tournament_id` → `tournaments.id`
- On Delete: RESTRICT (cannot delete tournament with participants)

### 2.3 participants → tournament_participants (1:N)

- A participant can register in multiple tournaments
- Each registration is for exactly one participant
- Foreign Key: `tournament_participants.participant_id` → `participants.id`
- On Delete: RESTRICT (cannot delete participant with registrations)

### 2.4 tournaments → matches (1:N)

- A tournament can have multiple matches
- Each match belongs to exactly one tournament
- Foreign Key: `matches.tournament_id` → `tournaments.id`
- On Delete: RESTRICT (cannot delete tournament with matches)

### 2.5 tournament_participants → matches (as participant1) (1:N)

- A participant can play as player 1 in multiple matches
- Each match has at most one player 1
- Foreign Key: `matches.participant1_id` → `tournament_participants.id`
- On Delete: RESTRICT

### 2.6 tournament_participants → matches (as participant2) (1:N)

- A participant can play as player 2 in multiple matches
- Each match has at most one player 2
- Foreign Key: `matches.participant2_id` → `tournament_participants.id`
- On Delete: RESTRICT

### 2.7 tournament_participants → matches (as winner) (1:N)

- A participant can win multiple matches
- Each match has at most one winner
- Foreign Key: `matches.winner_id` → `tournament_participants.id`
- On Delete: RESTRICT

### 2.8 matches → matches (next_match) (1:0..1)

- A match can advance to at most one next match
- A match can receive winners from multiple previous matches
- Foreign Key: `matches.next_match_id` → `matches.id`
- On Delete: RESTRICT

---

## 3. Indexes

| Table | Index Name | Columns | Purpose |
|-------|------------|---------|---------|
| tournaments | idx_tournaments_created_by | created_by | Fast lookup of user's tournaments |
| tournaments | idx_tournaments_status | status | Filter tournaments by status |
| tournament_participants | idx_tp_tournament | tournament_id | Fast lookup of tournament's participants |
| tournament_participants | idx_tp_participant | participant_id | Fast lookup of participant's tournaments |
| matches | idx_matches_tournament | tournament_id | Fast lookup of tournament's matches |
| matches | idx_matches_participant1 | participant1_id | Fast lookup of participant's matches |
| matches | idx_matches_participant2 | participant2_id | Fast lookup of participant's matches |
| matches | idx_matches_winner | winner_id | Fast lookup of participant's wins |
| matches | idx_matches_next_match | next_match_id | Fast bracket traversal |
| matches | idx_matches_round | tournament_id, round_number | Filter by tournament round |

---

## 4. Foreign Keys

| Table | Column | References | On Delete | On Update |
|-------|--------|------------|-----------|-----------|
| tournaments | created_by | users.id | RESTRICT | RESTRICT |
| tournament_participants | tournament_id | tournaments.id | RESTRICT | RESTRICT |
| tournament_participants | participant_id | participants.id | RESTRICT | RESTRICT |
| matches | tournament_id | tournaments.id | RESTRICT | RESTRICT |
| matches | participant1_id | tournament_participants.id | RESTRICT | RESTRICT |
| matches | participant2_id | tournament_participants.id | RESTRICT | RESTRICT |
| matches | winner_id | tournament_participants.id | RESTRICT | RESTRICT |
| matches | next_match_id | matches.id | RESTRICT | RESTRICT |

---

## 5. Design Decisions Justification

### 5.1 Separate participants Table

**Decision:** Created a separate `participants` table instead of reusing `users`.

**Justification:**
- Participants may not have user accounts (external players)
- Allows team names separate from usernames
- Cleaner separation of concerns
- Supports guest registrations

### 5.2 tournament_participants Junction Table

**Decision:** Used a junction table instead of direct relationship.

**Justification:**
- Many-to-many relationship between tournaments and participants
- Stores registration timestamp
- Unique constraint prevents duplicate registrations
- Can be referenced by matches table

### 5.3 String Enums Instead of Database Enums

**Decision:** Used VARCHAR with application-level validation instead of MySQL ENUM.

**Justification:**
- Easier to modify in future
- JPA/Hibernate handles validation
- More portable across databases
- Better for migrations

### 5.4 Self-Referencing matches Table

**Decision:** Used self-referencing FK for bracket progression.

**Justification:**
- Supports variable tournament sizes
- Enables efficient bracket traversal
- Single elimination requires knowing next match
- Allows flexible bracket generation

### 5.5 Nullable participant Columns in matches

**Decision:** Made participant1_id, participant2_id, winner_id nullable.

**Justification:**
- Initial bracket slots are empty
- BYEs create matches with one participant
- Winner determined after match completes
- Supports progressive bracket filling

### 5.6 ON DELETE RESTRICT Everywhere

**Decision:** Used RESTRICT for all foreign keys.

**Justification:**
- Prevents accidental data loss
- Forces explicit cleanup before deletion
- Maintains data integrity
- No cascading unintended deletions

### 5.7 Timestamps on All Tables

**Decision:** Added created_at and updated_at to all main tables.

**Justification:**
- Audit trail capability
- Useful for debugging
- Supports soft deletes if needed
- Standard practice for MVP

### 5.8 No Team Table

**Decision:** Not included as per requirements.

**Justification:**
- MVP scope only needs participants
- Teams can be represented as participant names
- Reduces complexity for initial release

### 5.9 No Player Table

**Decision:** Not included as per requirements.

**Justification:**
- MVP scope only needs participants
- Individual players are participants
- Rosters can be added in future phases

---

## 6. MVP Workflow Support

### Tournament Lifecycle

```
DRAFT → READY → ONGOING → FINISHED
```

### Registration Flow

1. User creates tournament (status: DRAFT)
2. Participants register via tournament_participants
3. User sets tournament to READY when registration closes
4. System generates bracket matches

### Bracket Generation (Single Elimination)

```
Round 1:        Round 2:       Final:
[M1] ─────┐
          ├─── [M3] ─────┐
[M2] ─────┘              │
                         ├─── [M5] → Winner
[M3] ─────┐              │
          ├─── [M4] ─────┘
[M4] ─────┘
```

### Match Progression

1. Match created with status PENDING
2. Participants assigned (status: READY)
3. Scores recorded, winner determined (status: FINISHED)
4. Winner advances to next_match

---

## 7. Validation Results

| Requirement | Status |
|-------------|--------|
| Schema creates on empty MySQL 8 | ✓ Pass |
| No circular foreign key issues | ✓ Pass |
| No redundant tables | ✓ Pass |
| No Team table | ✓ Pass |
| No Player table | ✓ Pass |
| No Draft-related tables | ✓ Pass |
| Supports MVP workflow | ✓ Pass |

---

## Files Created

| File | Description |
|------|-------------|
| `database/schema.sql` | Complete MySQL 8 schema |
| `database/ERD.md` | Mermaid ER diagram |
| `database/DATABASE_DESIGN.md` | This documentation |
