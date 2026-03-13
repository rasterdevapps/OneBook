# OneBook — Developer Onboarding Guide

> Everything a new developer needs to get started contributing to OneBook — Nexus Universal.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Repository Structure](#repository-structure)
3. [Local Development Setup](#local-development-setup)
4. [Building & Testing](#building--testing)
5. [Architecture Overview](#architecture-overview)
6. [Key Concepts](#key-concepts)
7. [Development Workflow](#development-workflow)
8. [Coding Standards](#coding-standards)
9. [Database Migrations](#database-migrations)
10. [Common Tasks](#common-tasks)

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Java | 21+ | Backend runtime (Virtual Threads / Project Loom) |
| Node.js | 20+ | Frontend build toolchain |
| Docker | Latest | PostgreSQL and Redis containers |
| Docker Compose | Latest | Multi-container orchestration |
| Git | Latest | Version control |

### Recommended IDE Setup

- **Backend**: IntelliJ IDEA (with Spring Boot and Lombok plugins)
- **Frontend**: VS Code (with Angular Language Service and ESLint extensions)
- **Database**: DBeaver or pgAdmin for PostgreSQL inspection

---

## Repository Structure

```
OneBook/
├── backend/                    # Spring Boot 3.4+ API (Gradle)
│   ├── src/main/java/          # Java source code
│   │   └── com/nexus/onebook/
│   │       ├── OneBookApplication.java
│   │       ├── HealthController.java
│   │       ├── config/         # HeadlessApiConfig, RedisConfig
│   │       └── ledger/         # Core business logic
│   │           ├── cache/      # WarmCacheService, CacheConstants
│   │           ├── controller/ # REST controllers
│   │           ├── dto/        # Request/Response records
│   │           ├── exception/  # GlobalExceptionHandler
│   │           ├── ingestion/  # Gateway, Adapters, Mapper
│   │           ├── model/      # JPA entities
│   │           ├── repository/ # Spring Data JPA repositories
│   │           ├── security/   # Encryption, BlindIndex, Audit
│   │           └── service/    # Business services
│   ├── src/main/resources/
│   │   ├── application.yml     # Configuration
│   │   └── db/migration/       # Flyway SQL migrations (V1–V8)
│   └── src/test/               # Test mirror of main structure
├── frontend/                   # Angular 19+ SPA
│   └── src/app/
│       ├── keyboard/           # Keyboard navigation module
│       │   ├── services/       # Registry, Navigation, Command
│       │   ├── components/     # CommandPaletteComponent
│       │   ├── directives/     # KeyboardContextDirective
│       │   └── models/         # KeyBinding, Command interfaces
│       ├── i18n/               # Transloco i18n configuration
│       └── ai/                 # AI dashboard components
├── docs/                       # Architecture documentation
├── docker-compose.yml          # PostgreSQL 17 + Redis 7
├── milestones.md               # Project milestone tracker
├── CONTRIBUTING.md             # Contribution guidelines
└── architecture.md             # Mermaid.js system diagram
```

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd OneBook
```

### Step 2: Start Infrastructure

```bash
docker compose up -d
```

This provisions:
- **PostgreSQL 17** on port 5432 (database: `onebook`, user: `onebook`, password: `onebook_secret`)
- **Redis 7** on port 6379

Verify infrastructure health:

```bash
docker compose ps
# Both containers should show "healthy" status
```

### Step 3: Run Backend

```bash
cd backend
./gradlew bootRun
```

The API starts at `http://localhost:8080` with:
- Virtual Threads (Project Loom) enabled
- Flyway migrations run automatically on startup
- Actuator health endpoint at `/actuator/health`

Verify: `curl http://localhost:8080/api/health`

### Step 4: Run Frontend

```bash
cd frontend
npm install
npm start
```

The Angular app starts at `http://localhost:4200` with an API proxy to the backend.

Verify: Open `http://localhost:4200` in your browser.

---

## Building & Testing

### Backend

```bash
cd backend

# Full build (compile + test)
./gradlew build

# Compile only
./gradlew compileJava

# Run tests only
./gradlew test

# Run a specific test class
./gradlew test --tests "com.nexus.onebook.ledger.service.JournalServiceTest"
```

**Test count**: 204 tests across unit and integration tests.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npx ng build --configuration=production

# Run tests (headless)
npx ng test --watch=false --browsers=ChromeHeadless

# Run tests (interactive)
npx ng test
```

**Test count**: 101 tests using Jasmine/Karma with TestBed.

### CI Pipeline

The GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on every push and PR:
1. **Backend job**: JDK 21 (Temurin) → `./gradlew build`
2. **Frontend job**: Node 20 → `npm ci` → `npx ng build` → `npx ng test --watch=false --browsers=ChromeHeadless`

---

## Architecture Overview

See the full [Architecture Diagram](architecture-diagram.md) for Mermaid.js diagrams.

### Layer Summary

| Layer | Technology | Key Components |
|-------|-----------|----------------|
| **Frontend** | Angular 19+ (Signals) | Command Palette, Keyboard Navigation, i18n |
| **API** | Spring Boot 3.4+ (Virtual Threads) | 15 REST controllers under `/api/*` |
| **Security** | AES-256-GCM, HMAC-SHA256 | FieldEncryptionService, BlindIndexService |
| **Cache** | Redis 7+ | WarmCacheService (cache-aside + write-through) |
| **Database** | PostgreSQL 17+ (RLS) | 21 tables with Row-Level Security |
| **Ingestion** | Pluggable Adapter Pattern | HL7, DMS, ISO 20022, Webhook adapters |

---

## Key Concepts

### Multi-Tenancy

Every table includes a `tenant_id` column. PostgreSQL Row-Level Security (RLS) enforces isolation at the database level. The application sets `app.current_tenant` as a session variable on each request.

### Double-Entry Accounting

Every financial transaction creates balanced debit/credit entries. A database trigger (`check_balanced_transaction`) prevents posting unbalanced transactions.

### Zero-Knowledge Encryption

Sensitive fields are encrypted with AES-256-GCM before reaching the database. The `FieldEncryptionService` handles encryption/decryption in the JVM. HMAC-based blind indexes enable searching without exposing plaintext.

### Cache-Aside Pattern

The `WarmCacheService` implements cache-aside reads and write-through puts. On login, the user's working set is decrypted and loaded into Redis. Cache misses fall back to the database transparently.

### Pluggable Ingestion

External systems feed data through protocol-specific adapters (`FinancialEventAdapter` interface). The `AdapterRegistry` discovers adapters via Spring dependency injection. The `UniversalMapper` normalizes all events into the core double-entry format.

---

## Development Workflow

### Branching Strategy

| Branch Pattern | Purpose |
|---------------|---------|
| `main` | Production-ready, always deployable |
| `feature/<description>` | New features |
| `fix/<description>` | Bug fixes |
| `chore/<description>` | Non-functional changes |

### Pull Request Process

1. Create a feature branch from `main`
2. Make changes with tests
3. Rebase on latest `main`
4. Open PR with description and test evidence
5. Pass CI checks (backend build + frontend build/test)
6. Code review and approval
7. Squash and merge

### Commit Messages

Use conventional commit style:
```
feat: add stock report API endpoint
fix: correct RLS policy for branches table
chore: update Spring Boot to 3.4.2
test: add trial balance service tests
docs: update API documentation
```

---

## Coding Standards

### Java (Backend)

- **Version**: Java 21+ features (records, sealed classes, pattern matching)
- **Framework**: Spring Boot 3.4+ with `@WebMvcTest` for controller tests, `@SpringBootTest` for integration
- **Annotations**: Use `@MockitoBean` (Spring Boot 3.4+ replacement for `@MockBean`)
- **Null Safety**: Avoid null; use `Optional` where appropriate
- **Testing**: Every service method has a corresponding test

### TypeScript/Angular (Frontend)

- **Version**: Angular 19+ with strict compilation
- **State**: Use Signals (not RxJS Subjects) for reactive state
- **Selectors**: Prefix with `app-` (e.g., `app-command-palette`)
- **Testing**: Jasmine/TestBed with `describe`/`it` blocks
- **Standalone**: All components are standalone (no NgModules)

### SQL

- **Keywords**: UPPERCASE (`SELECT`, `CREATE TABLE`, `WHERE`)
- **Tables**: lowercase with underscores (`ledger_accounts`, `journal_entries`)
- **Migrations**: Flyway naming convention: `V<version>__<description>.sql`
- **RLS**: Required on all tenant-scoped tables
- **Secrets**: Never in source code (use environment variables)

---

## Database Migrations

### Creating a New Migration

1. Create a file in `backend/src/main/resources/db/migration/`
2. Follow the naming convention: `V<next_version>__<description>.sql`
3. Use uppercase SQL keywords
4. Enable RLS on any new tenant-scoped table
5. Add appropriate indexes for query performance

### Migration Rules

- **Never** use `ddl-auto: create` or `update` — migrations only
- **Never** modify an existing migration file
- **Always** add RLS policies to tenant-scoped tables
- **Always** include `tenant_id` in unique constraints where applicable
- **Test** migrations by running `./gradlew build` (Flyway runs on startup)

### Current Migrations

| Version | Description |
|---------|-------------|
| V1 | RLS infrastructure (functions, roles, policies) |
| V2 | Organizational hierarchy (enterprises, branches, cost centers) |
| V3 | Core ledger and journal tables |
| V4 | Seed data (default enterprise, branch, cost center, accounts) |
| V5 | Zero-knowledge security (encrypted fields, blind indexes, audit log) |
| V6 | Ingestion layer (financial events, 3-way matching, card transactions) |
| V7 | Reporting, compliance, and fixed assets |
| V8 | AI features (investment holdings, corporate actions, digital assets) |

---

## Common Tasks

### Adding a New REST Endpoint

1. Create a DTO in `ledger/dto/` (use Java records)
2. Create a service in `ledger/service/`
3. Create a controller in `ledger/controller/` with `@RestController` and `@RequestMapping`
4. Add unit tests for service and controller
5. Document the endpoint in [API Documentation](api-documentation.md)

### Adding a New Ingestion Adapter

1. Implement `FinancialEventAdapter` interface in `ledger/ingestion/adapter/`
2. Define `getAdapterType()` to return the adapter identifier
3. Implement `parse(tenantId, rawPayload)` to return a `FinancialEvent`
4. The adapter is auto-discovered by `AdapterRegistry` via Spring DI
5. Add unit tests for parsing logic

### Adding a New Keyboard Shortcut

1. Register the binding in `KeyBindingRegistryService`
2. Register the command in `CommandRegistryService`
3. See [Key-Binding Registry Design](key-binding-registry.md) for details

---

## Related Documentation

- [Architecture Diagram](architecture-diagram.md)
- [Key-Binding Registry Design](key-binding-registry.md)
- [SQL Schema Documentation](sql-schema.md)
- [API Documentation](api-documentation.md)
- [Operational Runbook](operational-runbook.md)
- [Sub-Agent Instructions](../.github/agents/README.md) - Design patterns for specialist agents
