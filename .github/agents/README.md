# OneBook Sub-Agent Instructions

This directory contains instruction files for specialist sub-agents designed to manage context, enforce domain boundaries, and maintain engineering quality across the Nexus Universal platform.

## Purpose

Each agent instruction file provides:
- **Scope**: Which files, modules, and milestones the agent owns
- **Responsibilities**: What the agent is accountable for
- **Design Patterns**: Architectural patterns, conventions, and standards to follow
- **Best Practices**: Do's and don'ts specific to the agent's domain
- **References**: Links to relevant documentation and examples

## Available Agents

| Agent | File | Domain | Milestones |
|-------|------|--------|-----------|
| 🏗️ @Architect | `architect.md` | Foundation & Infrastructure | M1, M9 |
| 📒 @LedgerExpert | `ledger-expert.md` | Accounting Engine | M2, M7, M10 |
| 🔐 @SecurityWarden | `security-warden.md` | Zero-Knowledge Security | M3, M10 |
| ⚡ @PerfEngineer | `perf-engineer.md` | Performance & Caching | M4 |
| 🎹 @UXSpecialist | `ux-specialist.md` | Frontend & Keyboard Nav | M5, M7 |
| 🔌 @IntegrationBot | `integration-bot.md` | Ingestion & Adapters | M6 |
| 🧠 @AIEngineer | `ai-engineer.md` | Intelligence & Forecasting | M8 |
| 📋 @ComplianceAgent | `compliance-agent.md` | Tax & Regulatory | M7, M10 |
| 🛡️ @AuditAgent | `audit-agent.md` | Auditor Portal & Production | M10 |
| 📝 @DocAgent | `doc-agent.md` | Documentation Management | M9, Cross-cutting |

## Usage

When working on the OneBook codebase:
1. Identify which domain your task belongs to
2. Review the relevant agent instruction file
3. Follow the patterns, conventions, and standards defined
4. If working across multiple domains, consult the Sub-Agent Interaction Matrix in `sub-agents.md`

## Updates

These instruction files should be kept in sync with:
- `sub-agents.md` - Overall sub-agent architecture and interaction matrix
- `docs/developer-guide.md` - General developer onboarding guide
- `CONTRIBUTING.md` - Contribution guidelines
- Code examples in the repository

When adding new patterns or conventions, update the relevant agent instruction file(s).

## Maintaining Agent Ownership

**⚠️ IMPORTANT**: When you add new files, modules, services, controllers, or migrations to the codebase, you MUST update the appropriate agent instruction files to declare ownership.

See **[MAINTENANCE.md](MAINTENANCE.md)** for:
- Step-by-step guide on updating agent ownership
- Ownership rules for different component types
- Validation script usage (`.github/scripts/validate-agent-ownership.sh`)
- Examples and troubleshooting

**Quick validation**: Run `./.github/scripts/validate-agent-ownership.sh` to check for missing ownership declarations.
