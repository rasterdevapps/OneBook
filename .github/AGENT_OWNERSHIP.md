# Adding New Code? Update Agent Ownership! 📝

When you add new files, modules, services, or controllers to OneBook, you **MUST** update the agent ownership declarations.

## Quick Start

**1. Add your code**
```bash
# Create your new service, controller, or module
```

**2. Update agent ownership**
```bash
# Identify which agent owns your code
# See: .github/agents/MAINTENANCE.md for ownership rules

# Update the appropriate agent file in .github/agents/
# Add your new component to the "Files Owned" section
```

**3. Validate**
```bash
# Run the validation script
./.github/scripts/validate-agent-ownership.sh

# Should output: ✓ All modules, services, and controllers are documented
```

**4. Commit everything together**
```bash
git add .
git commit -m "Your changes"
```

## Why?

The OneBook sub-agent architecture requires clear ownership boundaries. When agents know which files they own, they can:
- Enforce domain-specific conventions
- Maintain consistent patterns
- Collaborate effectively on cross-cutting concerns
- Keep the codebase maintainable at scale

## Ownership Quick Reference

| What You Added | Which Agent Owns It | File to Update |
|----------------|---------------------|----------------|
| Core accounting service | @LedgerExpert | `ledger-expert.md` |
| Financial report | @LedgerExpert | `ledger-expert.md` |
| Security/encryption service | @SecurityWarden | `security-warden.md` |
| Cache-related service | @PerfEngineer | `perf-engineer.md` |
| Integration adapter | @IntegrationBot | `integration-bot.md` |
| Inventory/payroll service | @IntegrationBot | `integration-bot.md` |
| AI/forecasting service | @AIEngineer | `ai-engineer.md` |
| Tax/compliance service | @ComplianceAgent | `compliance-agent.md` |
| Audit/observability service | @AuditAgent | `audit-agent.md` |
| Frontend module (UI) | @UXSpecialist | `ux-specialist.md` |
| Database migration | Domain-specific agent | Various |

## Detailed Guide

For comprehensive ownership rules, examples, and troubleshooting, see:

📖 **[Agent Ownership Maintenance Guide](agents/MAINTENANCE.md)**

## CI Validation

The validation script runs automatically on all PRs. If you forget to update agent ownership, the CI build will fail with a clear message telling you what's missing.

---

**Questions?** See [agents/MAINTENANCE.md](agents/MAINTENANCE.md) or [agents/README.md](agents/README.md)
