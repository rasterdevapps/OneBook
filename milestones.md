# Nexus Universal — Strategic Milestones & Plan

> A phased roadmap to deliver a sector-agnostic, Zero-Trust, High-Performance Accounting OS that combines Tally-grade keyboard speed with 2026-grade security and AI.

> **How to use this checklist:** Mark each task as completed by changing `- [ ]` to `- [x]` once the work is done and verified.

---

## Milestone 1 — Foundation & Core Architecture

**Goal:** Establish the project skeleton, CI/CD pipeline, and foundational infrastructure so every subsequent milestone builds on solid ground.

- [x] Set up the monorepo structure (backend / frontend / shared libraries).
- [x] Bootstrap **Spring Boot 3.4+** (Java 21+) backend with Virtual Threads enabled.
- [x] Bootstrap **Angular 19+** frontend with Signals-based state management.
- [x] Provision **PostgreSQL 17+** with Row-Level Security (RLS) enabled.
  - [x] PostgreSQL 17 provisioned via Docker Compose and backend configured.
  - [x] Row-Level Security (RLS) infrastructure via Flyway migration (`V1__rls_infrastructure.sql`).
- [x] Provision **Redis 7+** for session and cache management.
- [x] Configure CI/CD pipelines (build, lint, test, deploy) and containerised local development (Docker Compose).
  - [x] Docker Compose configured for local development (PostgreSQL 17 + Redis 7).
  - [x] GitHub Actions CI pipeline (`.github/workflows/ci.yml`) — backend build/test, frontend build/test.
- [x] Define coding standards, branching strategy, and PR review workflows.
  - [x] `CONTRIBUTING.md` — branching strategy, PR workflow, Java/TypeScript/SQL coding standards.
  - [x] `.editorconfig` — consistent formatting across editors.

**Exit Criteria:** A deployable "Hello World" stack where all four layers (Angular → Spring Boot → Redis → PostgreSQL) communicate end-to-end.

---

## Milestone 2 — Universal Ledger & Double-Entry Engine

**Goal:** Build the core accounting engine — the heart of the system — using a sector-agnostic data model.

- [x] Design the **Universal Secured Ledger** SQL schema with JSONB columns for industry-specific metadata (Patient ID, VIN, SKU, etc.).
- [x] Implement the **Double-Entry Accounting Engine** (every transaction creates balanced debit/credit entries).
- [x] Build master data management: Chart of Accounts, Ledger Groups, Cost Centers.
- [x] Implement multi-entity hierarchy support (Enterprise → Branch → Cost Center).
- [x] Create seed data and migration scripts for initial account structures.
- [x] Write comprehensive unit and integration tests for ledger integrity (balance assertions, orphan detection).

**Exit Criteria:** Ability to create accounts, post journal entries, and verify trial balance correctness through automated tests.

---

## Milestone 3 — Zero-Knowledge Security Layer ("Blind DBA")

**Goal:** Ensure that sensitive financial data is unreadable at rest and by database administrators, while remaining fully searchable and performant.

- [ ] Implement **Selective Field-Level Encryption (AES-256-GCM)** in the JVM layer for sensitive values and names before database persistence.
- [ ] Build **Blind Indexing (HMAC-SHA256)** to enable fast, encrypted-field search without exposing plaintext.
- [ ] Implement the **Hash-Chained Audit Trail** — each audit record cryptographically linked to its predecessor for tamper detection.
- [ ] Design and implement key management (envelope encryption, key rotation strategy).
- [ ] Add encryption/decryption integration tests and tamper-detection tests for the audit chain.

**Exit Criteria:** A DBA with full database access cannot read sensitive ledger values; blind-index queries return correct results; any tampered audit row is detected.

---

## Milestone 4 — Redis "Warm Cache" & Performance Strategy

**Goal:** Eliminate encryption-induced latency for active users by decrypting and caching their working set in Redis upon login.

- [ ] Design the **Active Session Cache** strategy — on login, decrypt the user's current working set into Redis.
- [ ] Implement cache population, invalidation, and eviction policies.
- [ ] Integrate Virtual Threads (Project Loom) for handling high-concurrency API calls from external systems (HMS, ERP, DMS).
- [ ] Benchmark and tune: target sub-100 ms response times for common ledger and report queries.
- [ ] Implement cache-aside and write-through patterns to keep Redis and PostgreSQL in sync.
- [ ] Load-test with simulated concurrent sessions to validate throughput goals.

**Exit Criteria:** Authenticated users experience near-instant UI interactions; system sustains thousands of concurrent virtual-thread connections under load.

---

## Milestone 5 — "Better-than-Tally" Keyboard Navigation

**Goal:** Deliver a keyboard-first UX that matches or exceeds Tally's speed, enhanced with a modern Command Palette.

- [ ] Build the **Key-Binding Registry** — a configurable mapping layer for all shortcuts.
- [ ] Map all **legacy Tally shortcuts** (F4 Contra, F5 Payment, F7 Journal, Alt+C Create Master, Ctrl+A Save, etc.).
- [ ] Implement the **Command Palette (Cmd+K / Ctrl+K)** — a global Omni-Search for commands like "New Invoice," "Jump to Pharmacy Ledger," or "Show Stock."
- [ ] Implement **Contextual Power Keys** — shortcuts that adapt to the active screen (e.g., Enter = Drill-down in Reports, + = Add Column, / = Filter).
- [ ] Ensure full accessibility (ARIA roles, screen-reader support for keyboard flows).
- [ ] User-test with Tally-experienced accountants for feedback and iteration.

**Exit Criteria:** A trained user can complete all core accounting workflows (voucher entry, ledger lookup, report drill-down) without touching the mouse.

---

## Milestone 6 — Sector-Agnostic Universal Ingestion Layer

**Goal:** Allow any industry system to feed financial events into Nexus Universal through a standardised adapter pattern.

- [ ] Design and implement the **Financial Event Gateway** — a pluggable adapter interface for external data ingestion.
- [ ] Build reference adapters:
  - [ ] **HL7 adapter** for Healthcare systems.
  - [ ] **DMS adapter** for Automotive dealer management.
  - [ ] **REST/Webhook adapter** for generic SaaS integrations.
- [ ] Implement the **Universal Mapper** — transforms any adapter output into the core Double-Entry format with JSONB industry tags.
- [ ] Add validation, error handling, dead-letter queues, and retry policies for inbound events.
- [ ] Write adapter-specific integration tests with mock external systems.
- [ ] Build HRM/Payroll Connector: A specialized endpoint to ingest bulk salary disbursements with automated TDS and PF ledger posting.

[ ] Build Inventory Event Listener: To capture 'Stock-In/Stock-Out' events from Pharmacy/Stores and update the 'Valuation of Inventory' in the General Ledger.

**Exit Criteria:** Financial events from at least three different industry protocols are successfully ingested, transformed, and posted as balanced ledger entries.

---

## Milestone 7 — Reporting, Tax Compliance & Multi-Locale Support

**Goal:** Deliver configurable financial reports and localised tax compliance for global deployment.

- [ ] Build core financial reports: Trial Balance, Profit & Loss, Balance Sheet, Cash Flow Statement.
- [ ] Implement the **Feature Entitlement Engine** to toggle locale-specific modules (GST, VAT, IFRS, etc.) per tenant.
- [ ] Build configurable tax computation modules with pluggable rule engines.
- [ ] Support multi-currency with real-time exchange rate integration.
- [ ] Implement report export (PDF, Excel, CSV) and scheduled report generation.
- [ ] Write compliance validation tests against known tax scenarios.
- [ ] Implement Consolidated Cost-Center Reporting: Merge financial data from Pharmacy/Stores events with Payroll costs for true departmental Profit & Loss (P&L) analysis.

**Exit Criteria:** A tenant can be configured for a specific country/tax regime, generate statutory reports, and pass validation against sample regulatory filings.

---

## Milestone 8 — Advanced Intelligence & AI Features

**Goal:** Add predictive analytics and AI-driven insights to transform Nexus Universal from a record-keeping system into a decision-support platform.

- [ ] Implement **Predictive Cash Flow Forecasting** using historical ledger data.
- [ ] Build **Mark-to-Market (MTM) Valuation** engine for share-market investment portfolios.
- [ ] Add anomaly detection for unusual transactions (fraud indicators, duplicate entries).
- [ ] Create an AI-powered natural-language query interface ("What were my top 5 expenses last quarter?").
- [ ] Design dashboards and visualisations for AI-generated insights.

**Exit Criteria:** The system generates accurate 30/60/90-day cash flow forecasts; MTM valuations reconcile with market data; anomaly alerts fire on synthetic test data.

---

## Milestone 9 — Architecture Documentation & Deliverables

**Goal:** Produce the formal technical deliverables outlined in the project vision.

- [ ] Create the **Architecture Diagram** (Mermaid.js) illustrating: External Adapters → Encryption Layer → Redis Cache → PostgreSQL.
- [ ] Document the **Key-Binding Registry** technical design — legacy Tally keys vs. modern Command Palette logic, conflict resolution, and extensibility.
- [ ] Publish the **Universal Secured Ledger SQL Schema** documentation — encryption strategy, JSONB metadata conventions, and RLS policies.
- [ ] Write developer onboarding guides, API documentation, and operational runbooks.

**Exit Criteria:** All three deliverables (Architecture Diagram, Key-Binding Registry doc, SQL Schema doc) are published, reviewed, and approved.

---

## Milestone 10 — Hardening, Audit & Production Readiness

**Goal:** Prepare the system for production deployment with enterprise-grade reliability and security posture.

- [ ] Conduct a full security audit (penetration testing, encryption verification, key management review).
- [ ] Perform load and stress testing at projected production scale.
- [ ] Implement observability: structured logging, distributed tracing, and metrics dashboards.
- [ ] Set up disaster recovery: automated backups, point-in-time recovery, failover procedures.
- [ ] Finalise SLA definitions, monitoring alerts, and incident response playbooks.
- [ ] Obtain any required compliance certifications relevant to target industries.

**Exit Criteria:** The system passes security audit with no critical findings; meets defined SLA targets under load; disaster recovery procedures are tested and documented.

---

## 🤖 Subagent Operations (Nexus Universal)

To maintain 2026-grade performance and zero-trust context management, the following delegation rules are active:

### 1. Specialist Roles
- **@Architect**: Handles Milestone 1 & 9. Focus: Project skeleton, Monorepo structure, and Documentation.
- **@LedgerExpert**: Handles Milestone 2 & 7. Focus: SQL Schema, Double-Entry logic, and Tax/Compliance.
- **@SecurityWarden**: Handles Milestone 3 & 10. Focus: AES-256-GCM, HMAC-SHA256 Blind Indexing, and RLS policies.
- **@PerfEngineer**: Handles Milestone 4. Focus: Redis Warm Cache, Virtual Threads (Loom), and Benchmarking.
- **@UXSpecialist**: Handles Milestone 5. Focus: Angular 19 Signals, Keyboard Registry, and Tally-matching shortcuts.
- **@IntegrationBot**: Handles Milestone 6 & 8. Focus: HL7/DMS Adapters and AI Ingestion logic.

### 2. Delegation Protocol (The "3-File Rule")
**Trigger:** If a user request requires reading/analyzing **3 or more files** across different layers (e.g., Angular + Spring Boot + SQL).

**Action:** 1. **Spawn Subagent:** Use the `/research` or `@specialist` command.
2. **Isolate:** The subagent investigates the raw code.
3. **Distill:** Subagent returns ONLY the "Interface" or "Summary" to the Main Session.
4. **Result:** Keep the Main Session context < 5,000 tokens at all times.

### 3. Context Pruning
- After a Milestone is "Exit Criteria Met," summarize the final state into `PROJECT_STATE.md` and clear the subagent history to reclaim tokens.

----

## Summary Timeline

| Milestone | Theme | Dependencies |
|-----------|-------|--------------|
| 1 | Foundation & Core Architecture | — |
| 2 | Universal Ledger & Double-Entry Engine | 1 |
| 3 | Zero-Knowledge Security Layer | 2 |
| 4 | Redis Warm Cache & Performance | 3 |
| 5 | Keyboard Navigation & Command Palette | 1 |
| 6 | Sector-Agnostic Ingestion Layer | 2 |
| 7 | Reporting, Tax & Multi-Locale | 2, 6 |
| 8 | AI & Predictive Intelligence | 2, 7 |
| 9 | Architecture Documentation & Deliverables | 1–8 |
| 10 | Hardening, Audit & Production Readiness | 1–9 |

> **Note:** Milestones 5 and 6 can be developed in parallel with Milestones 3 and 4, as they are largely independent tracks (UX/Ingestion vs. Security/Performance). This parallelism can significantly compress the overall timeline.
