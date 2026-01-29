---
name: gsd:health
description: Diagnose GSD project health and detect issues
user-invocable: true
---

# GSD Health Check

Run diagnostics on your GSD project to detect issues before they cause problems.

## Execution Flow

### Step 1: Check GSD Installation

```bash
# Check VERSION file
GSD_VERSION=$(cat .claude/get-shit-done/VERSION 2>/dev/null || echo "NOT FOUND")
echo "GSD Version: $GSD_VERSION"

# Check required directories
ls -d .claude/agents .claude/commands/gsd .claude/skills/gsd .claude/get-shit-done 2>/dev/null
```

**Diagnosis:**
- VERSION not found: CRITICAL - GSD not installed
- Missing directories: CRITICAL - incomplete installation

### Step 2: Check Project Initialization

```bash
# Check .planning directory
ls -la .planning/ 2>/dev/null

# Check required files
ls .planning/PROJECT.md .planning/ROADMAP.md .planning/STATE.md 2>/dev/null
```

**Diagnosis:**
- `.planning/` not found: INFO - project not initialized (run `/gsd:new-project`)
- Missing PROJECT.md: WARN - no project definition
- Missing ROADMAP.md: WARN - no roadmap defined
- Missing STATE.md: WARN - no state tracking

### Step 3: Validate config.json

```bash
# Check if config.json exists and is valid JSON
if [ -f .planning/config.json ]; then
  node -e "JSON.parse(require('fs').readFileSync('.planning/config.json'))" 2>&1
fi
```

**Diagnosis:**
- Invalid JSON: CRITICAL - config.json is malformed
- Missing config.json: INFO - using defaults

### Step 4: Check STATE.md Synchronization

Parse STATE.md and verify:
1. Current phase exists in ROADMAP.md
2. Referenced files exist on disk
3. Progress percentage matches actual SUMMARY.md count

```bash
# Count expected vs actual summaries
PLAN_COUNT=$(find .planning/phases -name "*-PLAN.md" 2>/dev/null | wc -l)
SUMMARY_COUNT=$(find .planning/phases -name "*-SUMMARY.md" 2>/dev/null | wc -l)
echo "Plans: $PLAN_COUNT, Summaries: $SUMMARY_COUNT"
```

**Diagnosis:**
- Phase in STATE.md not in ROADMAP.md: WARN - state/roadmap mismatch
- Progress mismatch: WARN - STATE.md outdated

### Step 5: Detect Orphaned Files

```bash
# Find PLANs without SUMMARYs (incomplete execution)
for plan in .planning/phases/*/*-PLAN.md; do
  summary="${plan/-PLAN.md/-SUMMARY.md}"
  [ ! -f "$summary" ] && echo "Incomplete: $plan"
done

# Find SUMMARYs without PLANs (orphaned)
for summary in .planning/phases/*/*-SUMMARY.md; do
  plan="${summary/-SUMMARY.md/-PLAN.md}"
  [ ! -f "$plan" ] && echo "Orphaned: $summary"
done
```

**Diagnosis:**
- PLAN without SUMMARY: INFO - execution pending or incomplete
- SUMMARY without PLAN: WARN - orphaned summary (plan deleted?)

### Step 6: Check Phase Directory Structure

```bash
# Verify phase directories match roadmap
for dir in .planning/phases/*/; do
  phase_num=$(basename "$dir" | grep -oE '^[0-9]+')
  echo "Phase $phase_num: $dir"
done
```

**Diagnosis:**
- Phase directory not in ROADMAP: WARN - orphaned phase
- ROADMAP phase without directory: INFO - phase not yet created

### Step 7: Validate ROADMAP.md Format

Check ROADMAP.md has parseable structure:
- Phase headers (`### Phase N:`)
- Status markers (Completed/In Progress/Planned)
- Plan checkboxes

**Diagnosis:**
- Unparseable format: WARN - ROADMAP.md may cause issues

### Step 8: Check for Stale Debug Sessions

```bash
# Find old debug sessions
find .planning/debug -name "*.md" -mtime +7 2>/dev/null | head -5
```

**Diagnosis:**
- Old debug files: INFO - consider cleanup with `rm -rf .planning/debug/resolved/`

---

## Report Format

Output a health report:

```markdown
## GSD Health Report

**Project:** [from PROJECT.md or directory name]
**GSD Version:** [version]
**Status:** [HEALTHY / ISSUES FOUND / CRITICAL]

### Summary

| Category | Status | Details |
|----------|--------|---------|
| Installation | OK/WARN/CRITICAL | ... |
| Project Files | OK/WARN/CRITICAL | ... |
| Config | OK/WARN | ... |
| State Sync | OK/WARN | ... |
| Phase Structure | OK/WARN | ... |

### Issues Found

[If any issues, list them with severity]

| Severity | Issue | Fix |
|----------|-------|-----|
| CRITICAL | [issue] | [how to fix] |
| WARN | [issue] | [how to fix] |

### Recommendations

[List actionable recommendations]

### Quick Fixes Available

[If auto-fixable issues exist, list them]
- [ ] Regenerate STATE.md from artifacts
- [ ] Clean up stale debug sessions
- [ ] Remove orphaned files
```

---

## Auto-Fix (if user confirms)

If issues found, ask: "Would you like me to fix these issues?"

### Fix: Regenerate STATE.md

If STATE.md is out of sync, regenerate from artifacts using `gsd:state-reconstruction` skill.

### Fix: Clean Stale Debug Sessions

```bash
rm -rf .planning/debug/resolved/
find .planning/debug -name "*.md" -mtime +30 -delete
```

### Fix: Remove Orphaned Files

Ask user confirmation before removing any files.

### Fix: Create Missing Directories

```bash
mkdir -p .planning/phases .planning/todos .planning/debug
```

---

## Usage Examples

```bash
# Basic health check
/gsd:health

# Health check with auto-fix
/gsd:health --fix
```

---

## Success Criteria

Health check complete when:
- [ ] All diagnostic steps executed
- [ ] Report generated with clear status
- [ ] Issues listed with severity and fix suggestions
- [ ] Auto-fix offered if applicable issues found
