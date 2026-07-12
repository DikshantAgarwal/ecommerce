---
name: update-progress
description: Updates DAILY_PROGRESS.md (daily) and CHANGELOG.md (per completed feature) for the KuHu Apparels project. Follows strict rules: CHANGELOG only updates when a feature's full Definition of Done is met.
---

# Skill: Update Daily Progress & Changelog

Updates `DAILY_PROGRESS.md` (daily) and `CHANGELOG.md` (per completed feature) for the KuHu Apparels project.

---

## When to Run

End of each development session.

---

## File Update Rules

### `DAILY_PROGRESS.md` — Every Session
- Always append — never rewrite or delete existing entries.
- Each entry needs an anchor: `<a name="YYYY-MM-DD"></a>`
- Add a row in the top-level Daily Report Index table.
- Partial or incomplete work goes here.

### `CHANGELOG.md` — Per Completed Feature Only
A feature is **complete** only when its full Definition of Done is met. One component, hook, or endpoint in isolation does not count.

| Work | File | Reason |
|---|---|---|
| Created ProductCard component | DAILY_PROGRESS only | One component, user can't do anything |
| Created useProduct() hook | DAILY_PROGRESS only | Infrastructure only |
| Product Detail feature done | CHANGELOG + DAILY_PROGRESS | Full flow works end-to-end |
| Google OAuth partially done | DAILY_PROGRESS only | Token exchange not yet implemented |
| Google OAuth fully done | CHANGELOG + DAILY_PROGRESS | Login → token → profile → protected API all work |

**Rule of thumb:** If a user cannot accomplish a meaningful goal (login, view product, add to cart, place order), log it in DAILY_PROGRESS only.

---

## Before Generating Today's Report

Review: current source code, CHANGELOG.md, DAILY_PROGRESS.md, ROADMAP.md, ADRs.

Compare implementation with previous report to determine:
- What was completed today
- What changed since last report
- Current project health (on track / slightly behind / behind)
- Remaining work in sprint
- New learning topics discovered

---

## Process

### Step 1: Review Current State
Check the latest date in DAILY_PROGRESS, latest version in CHANGELOG, what was completed this session, and Definition of Done status for the current feature.

### Step 2: Append Today's Entry to DAILY_PROGRESS.md
**Never overwrite previous reports.** Add index row at top, then append daily entry at end. See [Daily Entry Template](#daily-entry-template).

### Step 3: Update CHANGELOG.md (Feature Complete Only)
- Follow Keep a Changelog format. Never rewrite history.
- Only append when a feature's full DoD is met.
- Ignore tiny refactoring, formatting, renames, or styling tweaks.
- Update project status only for significant progress.

If all DoD items are complete, add a new entry and update the Version History table. See [Changelog Entry Template](#changelog-entry-template).

### Step 4: Update Overall Status
If a feature completed, update the **Overall Progress** table in DAILY_PROGRESS.md.

---

## Templates

### Daily Entry Template

```markdown
<a name="YYYY-MM-DD"></a>
## YYYY-MM-DD

### ✅ Completed Today

**Backend**
- ...

**Frontend**
- ...

**Architecture / Learning**
- ...

**Documentation**
- ...

### 🎯 Current Focus

**Feature:** ...

**Definition of Done progress:**
- [ ] ...
- [x] ...

### 📌 End of Day

- **Biggest achievement:** ...
- **Sprint completion:** X/Y tasks
- **Current feature:** ...
- **Tomorrow:** ...

---
```

### Changelog Entry Template

```markdown
<a name="X-X-0---YYYY-MM-DD"></a>
## [X.X.0] — YYYY-MM-DD

### Added

- **Feature Name** — Description.

### Changed

- **Area** — Description.

### Project Status at vX.X.0

| Area | Status |
|---|---|
| ... | ... |
```

---

## Validation

- [ ] DAILY_PROGRESS index table has the new date row
- [ ] Daily entry appended at bottom, not inserted mid-file
- [ ] Anchor name matches the date in the heading
- [ ] CHANGELOG updated ONLY if feature's full DoD is met
- [ ] CHANGELOG Version History table updated
- [ ] No existing history rewritten or deleted
