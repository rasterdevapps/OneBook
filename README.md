# OneBook — Nexus Universal

A sector-agnostic, Zero-Trust, High-Performance Accounting OS.

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Backend     | Java 21+ / Spring Boot 3.4+      |
| Frontend    | Angular 19+ (Signals-based state) |
| Database    | PostgreSQL 17+ (RLS, JSONB)       |
| Cache       | Redis 7+                          |

## Monorepo Structure

```
OneBook/
├── backend/        # Spring Boot 3.4+ API (Gradle)
├── frontend/       # Angular 19+ SPA
├── docker-compose.yml
└── milestones.md
```

## Quick Start

### Prerequisites

- Java 21+
- Node.js 20+
- Docker & Docker Compose

### 1. Start Infrastructure

```bash
docker compose up -d
```

This provisions PostgreSQL 17 and Redis 7.

### 2. Run Backend

```bash
cd backend
./gradlew bootRun
```

The API starts at `http://localhost:8080` with Virtual Threads enabled.

### 3. Run Frontend

```bash
cd frontend
npm install
npm start
```

The Angular app starts at `http://localhost:4200` with API proxy to the backend.

### 4. Verify

- Frontend: http://localhost:4200
- Backend Health: http://localhost:8080/api/health
- Actuator: http://localhost:8080/actuator/health
