# Sub-Agent Design Requirements Implementation

**Date:** 2026-03-13  
**Status:** ✅ Complete

---

## What Was Done

In response to the question "have you added the design requirements to appropriate sub agent, so that the future development is seamless", this implementation has created comprehensive instruction files for all 10 specialist sub-agents defined in `sub-agents.md`.

### Files Created

#### Agent Instruction Directory: `.github/agents/`

**Core Files:**
- `README.md` - Overview of sub-agent instruction system
- `INDEX.md` - Quick reference index for finding design requirements

**Agent Instruction Files:**
1. `architect.md` (211 lines) - Foundation & Infrastructure patterns
2. `ledger-expert.md` (537 lines) - Accounting engine & double-entry patterns
3. `security-warden.md` (619 lines) - Encryption, RLS, audit chain patterns
4. `perf-engineer.md` (515 lines) - Caching & performance optimization patterns
5. `ux-specialist.md` (649 lines) - Angular Signals, keyboard nav, design system
6. `integration-bot.md` (542 lines) - Adapter pattern & ingestion pipeline
7. `ai-engineer.md` (341 lines) - Forecasting, MTM, anomaly detection
8. `compliance-agent.md` (364 lines) - Tax calculations, e-invoicing, reconciliation
9. `audit-agent.md` (442 lines) - Auditor portal, security audits, observability
10. `doc-agent.md` (306 lines) - Documentation maintenance & Mermaid diagrams

**Total:** 5,052 lines of design requirements, patterns, and conventions

---

## What Each Agent File Contains

### 1. Scope Section
- Lists all files, packages, and modules owned by the agent
- Defines which milestones the agent serves
- Clarifies boundaries of responsibility

### 2. Responsibilities Section
- High-level description of what the agent is accountable for
- Key objectives and quality standards
- Critical success criteria

### 3. Design Patterns & Conventions
- Code examples showing correct implementation patterns
- Architectural patterns to follow
- Naming conventions and code structure
- Database schema patterns
- API design patterns

### 4. Best Practices
- **✅ DO**: Recommended practices with rationale
- **❌ AVOID**: Anti-patterns and common mistakes
- Critical rules that must never be violated

### 5. Testing Patterns
- Test structure and naming conventions
- Example test code for common scenarios
- Testing tools and frameworks

### 6. Collaboration Section
- Lists which other agents to coordinate with
- References to Sub-Agent Interaction Matrix
- Cross-cutting concern coordination

### 7. References
- Links to relevant documentation
- External resources and standards
- Code examples in repository

---

## Key Design Requirements Documented

### Critical Invariants
- **Double-Entry Balance**: 3-level validation (service, trigger, exception) - NEVER post unbalanced
- **AES-256-GCM Encryption**: Unique random IV per operation - NEVER reuse IVs
- **Failure-Safe Caching**: Fall back to DB on Redis failure - NEVER fail requests
- **Angular Signals**: Use for state management - NOT RxJS Subjects for simple state
- **Tenant Isolation**: RLS + session variable on all queries - NEVER skip tenantId

### Architectural Patterns
- **Layered Architecture**: Controller → Service → Repository → Database
- **Pluggable Adapters**: `FinancialEventAdapter` interface + auto-discovery
- **Global Exception Handler**: Uniform error response structure
- **Lazy-Loaded Routes**: Standalone components with `loadComponent`
- **Cache-Aside + Write-Through**: For performance with encryption overhead

### Naming Conventions
- **Java**: PascalCase classes, camelCase methods, UPPER_SNAKE_CASE constants
- **Database**: snake_case tables/columns, idx_/trg_/uq_ prefixes
- **Angular**: kebab-case files, PascalCase classes, app- selector prefix
- **Cache Keys**: `onebook:cache:<domain>:<qualifier>:<identifier>`

### Testing Standards
- **Backend**: JUnit 5 + Mockito, `methodName_condition_result` naming
- **Frontend**: Jasmine + TestBed, standalone component testing
- **Coverage**: 405+ backend tests, 105+ frontend tests

---

## How to Use These Instructions

### For Future Agents

When assigned a task:

1. **Identify Domain**: Determine which agent domain the task belongs to
2. **Read Instructions**: Review the relevant agent instruction file(s)
3. **Follow Patterns**: Use the documented patterns and conventions
4. **Avoid Pitfalls**: Check the ❌ AVOID sections for common mistakes
5. **Collaborate**: Consult the Collaboration section for cross-cutting concerns

### Quick Navigation

Use `INDEX.md` to quickly find:
- Design patterns by category
- Common task types and which agent handles them
- Quick reference tables for conventions
- Navigation to specific agent files by domain

### For Developers

When working on OneBook:
- Reference agent instructions to understand established patterns
- Follow conventions to maintain consistency
- Update agent instructions when introducing new patterns
- Use as onboarding material for new team members

---

## Benefits for Future Development

### 1. Consistency
All future work follows documented patterns, ensuring codebase remains maintainable and predictable.

### 2. Efficiency
Agents don't need to explore code to understand patterns - they're explicitly documented with examples.

### 3. Quality
Best practices and anti-patterns are clearly defined, preventing common mistakes.

### 4. Discoverability
INDEX.md provides quick navigation to relevant patterns for any task type.

### 5. Collaboration
Clear guidance on when multiple agents need to work together on cross-cutting concerns.

### 6. Onboarding
New developers or agents can quickly understand system architecture and conventions.

### 7. Scalability
As the system grows (M10+), agents can operate independently within their bounded contexts.

---

## Validation

### Documentation Coverage ✅
- All 10 sub-agents from `sub-agents.md` have instruction files
- All major design patterns are documented with examples
- All critical invariants are explicitly called out
- All collaboration points are defined
- All references link to relevant documentation

### Pattern Coverage ✅
- Backend: Spring Boot, JPA, security, caching, ingestion
- Frontend: Angular Signals, keyboard navigation, i18n, design system
- Database: Flyway, RLS, triggers, JSONB metadata
- Testing: JUnit, Mockito, Jasmine, TestBed
- API: REST conventions, error handling, status codes

### Memory Storage ✅
- Sub-agent instruction locations stored in memory
- Critical patterns stored (balance validation, encryption, caching, signals, adapters)
- Build and test commands stored
- Error response format stored

---

## Next Steps

### For This PR
- ✅ All agent instruction files created
- ✅ INDEX.md for quick reference created
- ✅ Main documentation updated with references
- ✅ Critical facts stored in memory
- ✅ Code review completed (no issues)

### For Future Work
- Agents should reference these instructions when working on tasks
- @DocAgent should keep instructions in sync with code changes
- New patterns should be documented as they emerge
- Instructions should be updated when conventions change

---

## Conclusion

**The design requirements have been successfully added to appropriate sub-agents.**

Future development will be seamless because:
1. All 10 specialist agents have detailed instruction files
2. Every major design pattern is documented with working examples
3. Critical rules and anti-patterns are explicitly called out
4. Quick reference index enables fast navigation
5. Collaboration guidelines prevent conflicts between agents
6. Memory system preserves critical facts across sessions

The OneBook codebase now has a comprehensive foundation for consistent, high-quality development by both human developers and AI agents.
