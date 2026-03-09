# OneBook — Nexus Universal: Project Milestones

---

## Milestone 1 — Foundation & Core Architecture ✅

**Status:** ✅ Complete

**Goal:** Establish the project skeleton, CI/CD pipeline, and foundational infrastructure so every subsequent milestone builds on solid ground.

- [x] Set up the monorepo structure (backend / frontend / shared libraries).
- [x] Bootstrap Spring Boot 3.4+ (Java 21+) backend with Virtual Threads enabled.
- [x] Bootstrap Angular 19+ frontend with Signals-based state management.
- [x] Provision PostgreSQL 17+ with Row-Level Security (RLS) enabled.
- [x] PostgreSQL 17 provisioned via Docker Compose and backend configured.
- [x] Row-Level Security (RLS) infrastructure via Flyway migration (V1__rls_infrastructure.sql).
- [x] Provision Redis 7+ for session and cache management.
- [x] Configure CI/CD pipelines (build, lint, test, deploy) and containerised local development (Docker Compose).
- [x] Docker Compose configured for local development (PostgreSQL 17 + Redis 7).
- [x] GitHub Actions CI pipeline (.github/workflows/ci.yml) — backend build/test, frontend build/test.
- [x] Define coding standards, branching strategy, and PR review workflows.
- [x] CONTRIBUTING.md — branching strategy, PR workflow, Java/TypeScript/SQL coding standards.
- [x] .editorconfig — consistent formatting across editors.

**Exit Criteria:** A deployable "Hello World" stack where all four layers (Angular → Spring Boot → Redis → PostgreSQL) communicate end-to-end.

---

## Milestone 2 — Universal Ledger & Double-Entry Engine ✅

**Status:** ✅ Complete

**Goal:** Build the core accounting engine — the heart of the system — using a sector-agnostic data model.

- [x] Design the Universal Secured Ledger SQL schema with JSONB columns for industry-specific metadata (Patient ID, VIN, SKU, etc.).
- [x] Implement the Double-Entry Accounting Engine (every transaction creates balanced debit/credit entries).
- [x] Build master data management: Chart of Accounts, Ledger Groups, Cost Centers.
- [x] Implement multi-entity hierarchy support (Enterprise → Branch → Cost Center).
- [x] Create seed data and migration scripts for initial account structures.
- [x] Write comprehensive unit and integration tests for ledger integrity (balance assertions, orphan detection).

**Exit Criteria:** Ability to create accounts, post journal entries, and verify trial balance correctness through automated tests.

---

## Milestone 3 — Zero-Knowledge Security Layer ("Blind DBA")

**Status:** ✅ Complete

**Goal:** Ensure that sensitive financial data is unreadable at rest and by database administrators, while remaining fully searchable and performant.

- [x] Implement **Selective Field-Level Encryption (AES-256-GCM)** in the JVM layer for sensitive values and names before database persistence.
- [x] Build **Blind Indexing (HMAC-SHA256)** to enable fast, encrypted-field search without exposing plaintext.
- [x] Implement the **Hash-Chained Audit Trail** — each audit record cryptographically linked to its predecessor for tamper detection.
- [x] Design and implement key management (envelope encryption, key rotation strategy).
- [x] Add encryption/decryption integration tests and tamper-detection tests for the audit chain.

**Exit Criteria:** A DBA with full database access cannot read sensitive ledger values; blind-index queries return correct results; any tampered audit row is detected.

---

## Milestone 4 — Redis "Warm Cache" & Performance Strategy

**Status:** ✅ Complete

**Goal:** Eliminate encryption-induced latency for active users by decrypting and caching their working set in Redis upon login.

- [x] Design the Active Session Cache strategy — on login, decrypt the user's current working set into Redis.
- [x] Implement cache population, invalidation, and eviction policies.
- [x] Integrate Virtual Threads (Project Loom) for handling high-concurrency API calls from external systems (HMS, ERP, DMS).
- [x] Benchmark and tune: target sub-100 ms response times for common ledger and report queries.
- [x] Implement cache-aside and write-through patterns to keep Redis and PostgreSQL in sync.
- [x] Load-test with simulated concurrent sessions to validate throughput goals.

**Exit Criteria:** Authenticated users experience near-instant UI interactions; system sustains thousands of concurrent virtual-thread connections under load.

---

## Milestone 5 — "Better-than-Tally" Keyboard Navigation

**Status:** ⬜ Not Started

**Goal:** Deliver a keyboard-first UX that matches or exceeds Tally's speed, enhanced with a modern Command Palette.

- [ ] Build the Key-Binding Registry — a configurable mapping layer for all shortcuts.
- [ ] Map all legacy Tally shortcuts (F4 Contra, F5 Payment, F7 Journal, Alt+C Create Master, Ctrl+A Save, etc.).
- [ ] Implement the Command Palette (Cmd+K / Ctrl+K) — a global Omni-Search for commands like "New Invoice," "Jump to Pharmacy Ledger," or "Show Stock."
- [ ] Implement Contextual Power Keys — shortcuts that adapt to the active screen (e.g., Enter = Drill-down in Reports, + = Add Column, / = Filter).
- [ ] Ensure full accessibility (ARIA roles, screen-reader support for keyboard flows).
- [ ] User-test with Tally-experienced accountants for feedback and iteration.

**Exit Criteria:** A trained user can complete all core accounting workflows (voucher entry, ledger lookup, report drill-down) without touching the mouse.

---

## Milestone 6 — Sector-Agnostic Universal Ingestion Layer & Automation

**Status:** ⬜ Not Started

**Goal:** Allow any industry system to feed financial events into Nexus Universal through a standardised adapter pattern, alongside smart workflow automation.

- [ ] Design and implement the Financial Event Gateway — a pluggable adapter interface for external data ingestion.
- [ ] Build reference adapters:
  - [ ] HL7 adapter for Healthcare systems.
  - [ ] DMS adapter for Automotive dealer management.
  - [ ] ISO 20022 adapter for Banking and direct bank reconciliations.
  - [ ] REST/Webhook adapter for generic SaaS integrations.
- [ ] Implement the Universal Mapper — transforms any adapter output into the core Double-Entry format with JSONB industry tags.
- [ ] AP/AR Automation with OCR: Implement an AI module to read emailed PDF invoices, extract line items/totals, and auto-draft journal entries.
- [ ] Automated 3-Way Matching: Build the logic to automatically verify that the Purchase Order, Goods Receipt, and Vendor Invoice match before allowing payment.
- [ ] Corporate Card API Integration: Sync transactions instantly from corporate cards (Ramp/Brex equivalents).
- [ ] Build HRM/Payroll Connector & Inventory Event Listener (Stock-In/Stock-Out).

**Exit Criteria:** Financial events from multiple industry protocols and card providers are successfully ingested, transformed, and posted; invoices are parsed via OCR successfully.

---

## Milestone 7 — Reporting, Tax Compliance & Multi-Locale Support

**Status:** ⬜ Not Started

**Goal:** Deliver configurable financial reports, localized compliance, and enterprise-grade consolidation.

- [ ] Build core financial reports: Trial Balance, Profit & Loss, Balance Sheet, Cash Flow Statement.
- [ ] Implement Dynamic UI i18n/L10n using Angular Transloco for real-time language switching, date formats, and localized currency display ($ vs ₹).
- [ ] Implement the Feature Entitlement Engine to toggle locale-specific modules per tenant.
- [ ] Enhance Compliance Engine with automated e-Invoicing and e-Way bill generation.
- [ ] Implement Automated Reconciliation via real-time bank feeds using Open Banking APIs.
- [ ] Build Intercompany Accounting & Consolidation: Automate the elimination of intercompany transactions across global branches.
- [ ] Develop the Fixed Asset Register (FAR): Track physical assets, compute automated monthly depreciation, and handle impairment/disposal.
- [ ] Establish a Headless API approach ensuring the backend can seamlessly serve a future Flutter/Native mobile app.

**Exit Criteria:** A tenant can be configured for a specific country/tax regime, auto-generate e-invoices, and run global consolidated reports across multiple branches.

---

## Milestone 8 — Advanced Intelligence & AI Features

**Status:** ⬜ Not Started

**Goal:** Add predictive analytics and market integrations to transform Nexus Universal into a decision-support platform.

- [ ] Implement Predictive Cash Flow Forecasting using historical ledger data.
- [ ] Build AI-driven Scenario Modeling ("What-If" analysis) to simulate financial impacts of external factors (sales drops, interest hikes).
- [ ] Build Mark-to-Market (MTM) Valuation engine for share-market investment portfolios.
- [ ] Automate accounting for Corporate Actions (Stock Splits, Dividends, Bonus Issues) via financial APIs.
- [ ] Create a Market Sentiment Overlay on the CFO dashboard to display relevant market news.
- [ ] Add anomaly detection for unusual transactions (fraud indicators, duplicate entries).
- [ ] Implement Digital Asset & Crypto Ledger tracking for Mark-to-Market valuations of stablecoins/crypto.

**Exit Criteria:** The system generates accurate 30/60/90-day cash flow forecasts; MTM valuations reconcile with market APIs; stock splits are handled automatically.

---

## Milestone 9 — Architecture Documentation & Deliverables

**Status:** ⬜ Not Started

**Goal:** Produce the formal technical deliverables outlined in the project vision.

- [ ] Create the Architecture Diagram (Mermaid.js) illustrating: External Adapters → Encryption Layer → Redis Cache → PostgreSQL.
- [ ] Document the Key-Binding Registry technical design — legacy Tally keys vs. modern Command Palette logic, conflict resolution, and extensibility.
- [ ] Publish the Universal Secured Ledger SQL Schema documentation.
- [ ] Write developer onboarding guides, API documentation, and operational runbooks.

**Exit Criteria:** All architectural deliverables are published, reviewed, and approved.

---

## Milestone 10 — Hardening, Audit & Production Readiness

**Status:** ⬜ Not Started

**Goal:** Prepare the system for production deployment with enterprise-grade reliability and security posture.

- [ ] Build the "External Auditor" Portal: A secure, read-only interface for CPAs to request samples, leave comments, and approve workflows directly inside the system.
- [ ] Implement the Smart Document Vault: Ensure every journal entry can attach encrypted source documents stored securely in an S3/MinIO bucket.
- [ ] Conduct a full security audit (penetration testing, encryption verification, key management review).
- [ ] Perform load and stress testing at projected production scale.
- [ ] Implement observability: structured logging, distributed tracing, and metrics dashboards.
- [ ] Set up disaster recovery: automated backups, point-in-time recovery, failover procedures.
- [ ] Obtain required compliance certifications relevant to target industries.

**Exit Criteria:** The system passes security audit with no critical findings; the Auditor Portal functions end-to-end; disaster recovery procedures are tested.

---

## 🤖 Subagent Operations (Nexus Universal)

To maintain 2026-grade performance and zero-trust context management, the following delegation rules are active:

### 1. Specialist Roles

| Role | Milestones | Focus |
|------|-----------|-------|
| @Architect | 1 & 9 | Project skeleton, Monorepo structure, and Documentation |
| @LedgerExpert | 2, 7, & 10 | SQL Schema, Double-Entry logic, Tax/Compliance, and Auditor Portal |
| @SecurityWarden | 3 & 10 | AES-256-GCM, HMAC-SHA256 Blind Indexing, RLS policies, and Document Vault |
| @PerfEngineer | 4 | Redis Warm Cache, Virtual Threads (Loom), and Benchmarking |
| @UXSpecialist | 5 & 7 | Angular 19 Signals, Keyboard Registry, Tally shortcuts, and i18n/L10n |
| @IntegrationBot | 6 & 8 | HL7/DMS/ISO 20022 Adapters, OCR logic, and AI Ingestion |

### 2. Delegation Protocol (The "3-File Rule")

**Trigger:** If a user request requires reading/analyzing 3 or more files across different layers (e.g., Angular + Spring Boot + SQL).

**Action:**

1. **Spawn Subagent:** Use the `/research` or `@specialist` command.
2. **Isolate:** The subagent investigates the raw code.
3. **Distill:** Subagent returns ONLY the "Interface" or "Summary" to the Main Session.
4. **Result:** Keep the Main Session context < 5,000 tokens at all times.

### 3. Context Pruning

After a Milestone is "Exit Criteria Met," summarize the final state into `PROJECT_STATE.md` and clear the subagent history to reclaim tokens.

---

## Summary Timeline

| Milestone | Theme | Status | Dependencies |
|-----------|-------|--------|-------------|
| 1 | Foundation & Core Architecture | ✅ Complete | — |
| 2 | Universal Ledger & Double-Entry Engine | ✅ Complete | 1 |
| 3 | Zero-Knowledge Security Layer & Controls | ✅ Complete | 2 |
| 4 | Redis Warm Cache & Performance | ✅ Complete | 3 |
| 5 | Keyboard Navigation & Command Palette | ⬜ Not Started | 1 |
| 6 | Universal Ingestion, Integrations & Automation | ⬜ Not Started | 2 |
| 7 | Reporting, Tax, Compliance & FAR | ⬜ Not Started | 2, 6 |
| 8 | Advanced Intelligence, Forecasting & Markets | ⬜ Not Started | 2, 7 |
| 9 | Architecture Documentation & Deliverables | ⬜ Not Started | 1–8 |
| 10 | Hardening, Auditor Portal & Prod Readiness | ⬜ Not Started | 1–9 |
