---
name: feature-implementation
description: Guided workflow for implementing features one task at a time. Reads DAILY_PROGRESS.md, CHANGELOG.md, and docs/ to understand current progress, then walks through selection, implementation, testing, and validation. Triggered automatically when user says "Implement <feature>".
---

# Skill: Feature Implementation

Guided workflow for implementing features one task at a time. Sources of truth: `docs/DAILY_PROGRESS.md`, `docs/CHANGELOG.md`, and handbooks under `docs/handbook/`.

---

## Trigger

This skill is automatically suggested when you say **"Implement [feature name]"** or similar phrases indicating feature work.

---

## Workflow

### Step 1 — Understand Current Progress

Read `docs/DAILY_PROGRESS.md`.

Identify:
- Current Feature
- Definition of Done
- Completed tasks
- Remaining tasks

If the current feature is complete, move to the next feature defined in `docs/handbook/02_Roadmap.md`.

---

### Step 2 — Select ONE Task

Choose only the next incomplete task from the Definition of Done of the current feature.

Do NOT combine multiple Definition of Done items into one implementation unless they are inseparable.

Focus on one logical unit of work.

---

### Step 3 — Verify Before Coding

Before implementing:

- Check whether similar functionality already exists in the codebase.
- Follow the existing project architecture (see `docs/handbook/03_Architecture_Decisions.md`).
- Follow API conventions (see `docs/handbook/05_API_Conventions.md`).
- Reuse existing utilities and components where appropriate.
- Avoid introducing duplicate logic.
- Ask for clarification only if a requirement is genuinely ambiguous.

---

### Step 4 — Implement

Implement only the selected task.

Requirements:

- Keep the solution simple.
- Follow existing coding style.
- Write clean, maintainable code.
- Handle expected error cases.
- Avoid unnecessary refactoring.
- Do not modify unrelated files.

---

### Step 5 — Testing

Testing is mandatory. Write **unit tests** for every implementation.

**Frontend** — [React Testing Library](https://testing-library.com/react) with [Vitest](https://vitest.dev/):

- Install: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`
- Co-locate tests next to their source files: `ComponentName.test.tsx`
- Test component rendering, user interactions, loading/error/empty states
- Mock API calls at the service layer, not network-level, unless testing integration

**Backend** — [pytest](https://docs.pytest.org/) with [pytest-django](https://pytest-django.readthedocs.io/):

- Install: `pytest`, `pytest-django`, `pytest-cov`
- Use Django's `TestCase` or `pytest-django`'s `db` marker for database tests
- Test API views with DRF's `APIClient` or `pytest-django`'s `client`
- Co-locate tests in `tests/` directories within each Django app

**Pattern** for every change:

- Write tests first or alongside the implementation.
- Ensure existing tests continue to pass.
- Cover the happy path, error states, and edge cases.
- If dependencies aren't installed yet, propose the install commands.

A task is not complete until its tests pass.

---

### Step 6 — Validation

Before considering the task complete, verify:

- Project builds successfully.
- No linting issues.
- No type errors.
- No obvious regressions.
- Implementation satisfies the selected Definition of Done item.

---

### Step 7 — Completion Report

When finished, provide:

## Completed

Explain what was implemented.

## Tests

List automated tests added/updated or manual verification performed.

## Files Changed

Summarize the files modified.

## Remaining

State the next Definition of Done item that should be implemented next.

Stop after completing the current task.

Do NOT begin the next task automatically.

---

## Rules

1. **One task at a time** — implement only the selected task, never multiple.
2. **Never skip prerequisites** — complete Definition of Done items in order.
3. **Never redesign existing architecture** without justification.
4. **Never implement future roadmap items** — stay focused on the current feature.
5. **Keep changes focused and minimal** — no unrelated refactoring.
6. **Prefer consistency over cleverness** — match existing patterns.
7. **Follow project documentation over assumptions** — check docs first.
8. **If blocked, explain the blocker** instead of guessing or implementing a workaround.

---

## Priority Enforcement

When you say **"Implement [feature name]"**:

1. Read `docs/DAILY_PROGRESS.md` to identify the next pending Definition of Done item.
2. If the requested feature does not match the next priority task, explain which task should come first and ask for confirmation.
3. If you still insist on implementing your requested feature first, the skill defers to your request and implements it.

This ensures the roadmap is respected by default while keeping you in control.
