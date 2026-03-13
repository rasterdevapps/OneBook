# Validation Scripts

This directory contains validation scripts to ensure code quality and consistency across the OneBook codebase.

## Available Scripts

### validate-agent-ownership.sh

**Purpose**: Validates that all modules, services, controllers, and packages in the codebase are properly documented in agent instruction files.

**Usage**:
```bash
./.github/scripts/validate-agent-ownership.sh
```

**What it checks**:
- ✅ All frontend modules in `frontend/src/app/` are documented
- ✅ All backend services in `backend/src/main/java/.../service/` are documented
- ✅ All backend controllers in `backend/src/main/java/.../controller/` are documented
- ✅ All backend packages in `backend/src/main/java/.../ledger/` are documented
- ⚠️ Database migrations (warnings only, doesn't fail)

**Exit codes**:
- `0` - All components are documented ✓
- `1` - Missing ownership declarations found ✗

**When to run**:
- Before submitting a PR that adds new code
- After adding new modules, services, or controllers
- As part of CI/CD pipeline (automatically runs on all PRs)

**How to fix failures**:
1. Review the missing components listed in the output
2. Refer to [MAINTENANCE.md](../agents/MAINTENANCE.md) for ownership rules
3. Update the appropriate agent instruction file in `.github/agents/`
4. Re-run the script to verify

**Example output**:
```
🔍 Validating agent ownership documentation...

📁 Checking Frontend Modules...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✗ Missing: Frontend Module - frontend/src/app/newmodule

⚙️  Checking Backend Services...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✗ Missing: Backend Service - NewFeatureService

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✗ Some components are missing from agent documentation
```

## CI/CD Integration

This script is automatically run as part of the CI pipeline defined in `.github/workflows/ci.yml`. If the script fails, the PR build will fail, alerting developers to update agent ownership before merging.

## Related Documentation

- [Agent Ownership Maintenance Guide](../agents/MAINTENANCE.md) - How to update agent files
- [Agent Instructions README](../agents/README.md) - Overview of agent system
- [Design Requirements Index](../agents/INDEX.md) - Quick reference by category

---

**Last Updated:** 2026-03-13  
**Maintained By:** @Architect
