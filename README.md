# 🏆 Esport Tournament System

A full-stack web application for managing esport tournaments with single-elimination bracket generation, real-time score updates, and automatic winner progression.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Tournament Lifecycle](#tournament-lifecycle)
- [Bracket Algorithm](#bracket-algorithm)
- [Default Credentials](#default-credentials)

---

## Overview

Esport Tournament System allows organizers to create and manage tournaments end-to-end — from registering participants, generating a single-elimination bracket, submitting match scores, to crowning a champion. The UI renders a professional tournament tree similar to Challonge, Start.gg, and Liquipedia.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Axios, Vite |
| **Backend** | Spring Boot 3.2, Spring Security, Spring Data JPA |
| **Database** | MySQL 8 |
| **Auth** | JWT (JJWT 0.12.5), BCrypt |
| **Build** | Maven (backend), Vite (frontend) |
| **Language** | Java 17, JavaScript (ESM) |

---

## Features

- **Authentication** — JWT-based login, protected routes, persistent session via localStorage
- **Tournament Management** — Create, update, delete tournaments (DRAFT status only)
- **Participant Management** — Global participant registry; add, edit, delete participants
- **Registration** — Register / unregister participants per tournament; auto status transitions
- **Bracket Generation** — Random single-elimination bracket (power-of-2 participant counts)
- **Score Submission** — Submit scores for READY matches; draws are rejected
- **Winner Progression** — Winner automatically advances to the next match
- **Champion Display** — Gold trophy card shown when the tournament is FINISHED
- **Dashboard** — Summary statistics across all tournaments
- **Responsive UI** — Horizontal bracket on desktop, vertical stacked layout on mobile

---

## Project Structure

```
tournament/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/example/tournament/
│       ├── TournamentApplication.java
│       ├── config/
│       │   ├── DatabaseSeeder.java       # Seeds default admin user on startup
│       │   └── SecurityConfig.java       # JWT filter chain, CORS, BCrypt
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── TournamentController.java
│       │   ├── TournamentRegistrationController.java
│       │   ├── ParticipantController.java
│       │   ├── MatchController.java
│       │   ├── BracketController.java
│       │   ├── DashboardController.java
│       │   └── HealthController.java
│       ├── service/                      # Business logic layer
│       ├── repository/                   # Spring Data JPA repositories
│       ├── entity/                       # JPA entities (Tournament, Match, Participant, …)
│       ├── dto/                          # Request / Response DTOs
│       ├── enums/                        # TournamentStatus, MatchStatus, UserRole
│       ├── security/                     # JwtAuthenticationFilter, UserDetailsServiceImpl
│       ├── util/                         # JwtService
│       └── exception/                    # GlobalExceptionHandler, custom exceptions
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                       # Routes definition
│       ├── api/                          # Axios API clients
│       ├── context/                      # AuthContext (JWT storage)
│       ├── pages/                        # Dashboard, Tournament, TournamentDetail, Participant, Profile
│       ├── components/
│       │   ├── bracket/                  # Bracket UI (rebuilt from scratch)
│       │   │   ├── Bracket.jsx           # Root — computes positions, wires all columns
│       │   │   ├── BracketRound.jsx      # Single round column
│       │   │   ├── BracketMatch.jsx      # Fixed 260×120px match card
│       │   │   ├── BracketConnector.jsx  # SVG connector lines (──┐│──┘)
│       │   │   ├── BracketChampion.jsx   # Gold champion card
│       │   │   └── Bracket.css          # Esports dark-panel styling
│       │   ├── TournamentBracket.jsx     # Thin wrapper consumed by TournamentDetail
│       │   ├── MatchScoreForm.jsx
│       │   ├── NavBar.jsx
│       │   └── …
│       └── styles/
│           └── index.css                 # Global tokens, buttons, badges, modals
│
└── database/
    ├── schema.sql                        # Full DDL (MySQL 8)
    ├── DATABASE_DESIGN.md
    └── ERD.md
```

---

## Database Schema

```
users
  id · username · password · role · created_at · updated_at

tournaments
  id · name · game · description · host · max_participants
  status (DRAFT|READY|ONGOING|FINISHED) · created_by(FK) · timestamps

participants
  id · name · timestamps

tournament_participants
  id · tournament_id(FK) · participant_id(FK) · registered_at
  UNIQUE(tournament_id, participant_id)

matches
  id · tournament_id(FK) · round_number · match_number
  participant1_id(FK) · participant2_id(FK)
  score1 · score2 · winner_id(FK) · next_match_id(FK)
  status (PENDING|READY|FINISHED) · timestamps
```

---

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8

### 1. Database setup

Create the schema (the app will create tables automatically via Hibernate DDL, but you can also run the schema manually):

```sql
CREATE DATABASE esport_tournament_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or run the provided DDL:

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend configuration

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/esport_tournament_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password

jwt.secret=your-secret-key-minimum-256-bits
jwt.expiration=86400000
```

### 3. Run the backend

```bash
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.  
On first startup, `DatabaseSeeder` creates the default admin account automatically.

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.  
API calls are proxied to `http://localhost:8080` via Vite's dev proxy — no CORS configuration needed during development.

### 5. Build for production

```bash
# Backend
cd backend
mvn clean package
java -jar target/tournament-0.0.1-SNAPSHOT.jar

# Frontend
cd frontend
npm run build
# Serve the dist/ folder with any static file server
```

---

## API Reference

All endpoints (except `/api/health` and `/api/auth/**`) require the `Authorization: Bearer <token>` header.

All responses follow a unified envelope:

```json
{
  "success": true,
  "message": "…",
  "data": { … }
}
```

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login and receive JWT token |

**Request body:**
```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

**Response `data`:**
```json
{
  "token": "eyJ…",
  "type": "Bearer",
  "user": { "id": 1, "username": "admin", "role": "ADMIN" }
}
```

---

### Tournaments

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tournaments` | List all tournaments |
| `GET` | `/api/tournaments/{id}` | Get tournament by ID |
| `GET` | `/api/tournaments/my` | List tournaments created by current user |
| `POST` | `/api/tournaments` | Create tournament (status defaults to DRAFT) |
| `PUT` | `/api/tournaments/{id}` | Update tournament (DRAFT only, owner only) |
| `DELETE` | `/api/tournaments/{id}` | Delete tournament (DRAFT only, owner only) |

---

### Participants

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/participants` | List all participants |
| `GET` | `/api/participants/{id}` | Get participant by ID |
| `POST` | `/api/participants` | Create participant |
| `PUT` | `/api/participants/{id}` | Update participant name |
| `DELETE` | `/api/participants/{id}` | Delete participant (409 if registered in any tournament) |

---

### Tournament Registration

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tournaments/{id}/participants` | List registered participants |
| `POST` | `/api/tournaments/{id}/participants` | Register participant (DRAFT only) |
| `DELETE` | `/api/tournaments/{id}/participants/{participantId}` | Unregister participant (DRAFT only) |

---

### Bracket

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/tournaments/{id}/generate-bracket` | Generate single-elimination bracket |
| `GET` | `/api/tournaments/{id}/bracket` | Get bracket grouped by round |

**Bracket response `data`:**
```json
{
  "totalRounds": 3,
  "totalMatches": 7,
  "rounds": {
    "1": [ { "id": 1, "matchNumber": 1, "roundNumber": 1, "status": "READY", … }, … ],
    "2": [ … ],
    "3": [ … ]
  }
}
```

---

### Matches

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tournaments/{id}/matches` | List all matches for a tournament |
| `GET` | `/api/matches/{id}` | Get match by ID |
| `PUT` | `/api/matches/{id}/score` | Submit scores for a READY match |

**Score request body:**
```json
{
  "score1": 2,
  "score2": 1
}
```

---

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Summary statistics |

---

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check (no auth required) |

---

## Tournament Lifecycle

```
DRAFT ──(full registration)──► READY ──(generate bracket)──► ONGOING ──(final match finished)──► FINISHED
  ▲                               │
  └──(unregister participant)─────┘
```

| Status | Description |
|---|---|
| `DRAFT` | Tournament is being set up; participants can be added or removed |
| `READY` | `maxParticipants` slots are filled; bracket can now be generated |
| `ONGOING` | Bracket has been generated; matches are in progress |
| `FINISHED` | The final match has been played; a champion has been determined |

Status transitions are automatic — the service layer handles them based on participant count and match results.

---

## Bracket Algorithm

1. **Validation** — tournament must be `READY`, participant count must equal `maxParticipants`, count must be a power of 2 (2, 4, 8, 16, 32), bracket must not already exist.
2. **Shuffle** — participants are randomised using `Collections.shuffle`.
3. **Round 1 matches** — participants are paired sequentially into `N/2` matches with status `READY`.
4. **Later round matches** — all remaining matches are created with status `PENDING` and no participants yet.
5. **`nextMatch` pointers** — each match is linked to the match where its winner will advance.
6. **Score submission** — when a `READY` match score is submitted:
   - Draw scores are rejected (400).
   - Winner is determined automatically.
   - Winner is placed into their `nextMatch` slot.
   - If `nextMatch` now has both participants, its status becomes `READY`.
   - If the final match is completed, tournament status becomes `FINISHED`.

---

## Bracket UI

The frontend renders a proper tournament tree using mathematically computed card positions:

- Every match card is fixed at **260 × 120 px**.
- Card vertical position is calculated as: `top = ((CARD_HEIGHT + CARD_GAP) × 2^(roundNumber−1) − CARD_HEIGHT) / 2 + index × stride`
- SVG connector lines draw the classic `──┐ │ ──┘` shape between every pair of source cards and their target card.
- A gold trophy champion card is shown at the end of the tree when `winnerName` is populated on the final match.

---

## Default Credentials

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `Admin123!` |

The admin account is seeded automatically on the first backend startup. Change the password after initial login.

---

## Environment Variables Summary

| Property | Default | Description |
|---|---|---|
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/esport_tournament_db` | MySQL connection URL |
| `spring.datasource.username` | `root` | Database username |
| `spring.datasource.password` | *(empty)* | Database password |
| `server.port` | `8080` | Backend server port |
| `jwt.secret` | *(see application.properties)* | HS256 signing key (min 256 bits) |
| `jwt.expiration` | `86400000` | Token expiry in ms (24 hours) |

> **Security note:** Replace `jwt.secret` with a strong random value before deploying to production. Never commit credentials to version control.
