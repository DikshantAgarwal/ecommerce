---
name: frontend-review
description: Reviews frontend code (staged diff, working changes, or PR) against React best practices, TypeScript strictness, performance patterns, and the project's UI/CSS conventions defined in docs/handbook/04_UI_Design_Bible.md.
---

# Skill: Frontend Code Review

Reviews frontend code (staged diff, working changes, or PR) against React best practices, TypeScript strictness, performance patterns, and the project's UI/CSS conventions defined in `docs/handbook/04_UI_Design_Bible.md`.

---

## Trigger

This skill is automatically suggested when you ask for a **code review**, **frontend review**, or **PR review**.

---

## How to Run

1. Read the current diff (`git diff`) or staged changes (`git diff --staged`).
2. If reviewing a PR, fetch the PR branch and diff against base.
3. Review each changed file against the rules below.
4. Return a structured report with issues grouped by severity.

---

## Report Format

```markdown
## Frontend Review — <file path>

### 🔴 Critical
- ...

### 🟡 Warning
- ...

### 🔵 Suggestion
- ...

---

**Overall:** ✅ Pass / ⚠️ Needs Changes / ❌ Blocking
```

---

## Review Categories

### 1. TypeScript — Strong Typing

- No `any` — use `unknown` if the type is genuinely not known, then narrow it.
- No `as` casts unless the type system cannot express the constraint (rare).
- Prefer `interface` for object shapes (props, state, API responses).
- Prefer `type` for unions, intersections, and utility types.
- Reuse existing types from `src/types/` — do not redefine shapes.
- Import types with `type` prefix: `import type { Product } from '../types'`.
- Use strict `null`/`undefined` checks — prefer `??` over `||` for defaulting.
- Avoid optional chaining on required fields — if a field should always exist, type it as required.

### 2. React — Hooks & Component Patterns

- Hooks must follow the **Rules of Hooks** — no conditional calls, same order every render.
- `useEffect` dependency arrays must include every reactive value used inside.
- No unnecessary `useEffect` — derive state from props during render where possible.
- Avoid `useState` for values that can be computed — use `useMemo` or plain derivation instead.
- Extract reusable logic into **custom hooks** (see `src/hooks/` patterns).
- Props interfaces must be defined and exported for reusable components.
- Use composition over prop drilling — if a prop passes through 3+ levels, consider context or lifting state.

### 3. Performance

- `useMemo` / `useCallback` only when there is a measurable re-render problem — not prophylactically.
- Avoid inline object/array/function creation in props of frequently re-rendered children.
- Lists need a stable `key` — never use array index unless the list is static.
- Heavy components (modals, rich text editors, charts) should be lazy-loaded with `React.lazy` + `Suspense`.
- Bundle impact: check that imports are tree-shakeable (barrel exports from `src/components/` are fine; avoid importing entire libraries for one utility).

### 4. UI & CSS — Project Conventions

Reference: `docs/handbook/04_UI_Design_Bible.md` for exact tokens.

#### 4a. Mobile-First

- Build for mobile by default. Add `sm:`, `md:`, `lg:` breakpoints only when the mobile layout needs adjustment.
- Never design desktop-first.

#### 4b. Tailwind Only

- Prefer Tailwind utilities. No inline styles unless absolutely necessary (dynamic values that can't use tokens).
- No custom CSS if Tailwind already provides the utility.
- Use the project's custom tokens: `primary-*`, `accent-*`, `neutral-*`, `heading`, `body` fonts.
- Avoid arbitrary values (`w-[387px]`, `mt-[13px]`) unless the design explicitly requires an exact value not in the scale.
- Use the project's spacing scale: `p-4`, `gap-6`, `space-y-4`. Refer to `docs/handbook/04_UI_Design_Bible.md#4-spacing`.

#### 4c. Responsive Layout

- Use Flexbox/Grid appropriately for layout.
- Avoid fixed widths/heights on containers — let content define size.
- Prevent horizontal scrolling — check for overflow at all breakpoints.

#### 4d. Consistent Spacing

- Use the project's spacing scale (`p-4`, `gap-6`, `space-y-4`).
- Avoid random spacing values. Reference the design bible for spacing rules.

#### 4e. Accessibility

- All interactive elements must have visible focus states.
- Color contrast must meet WCAG AA (4.5:1 normal text, 3:1 large text).
- Form controls must have associated `<label>` elements (visible or `.sr-only`).
- All interactive elements must be keyboard accessible.
- Use semantic HTML (`<button>` not `<div onClick>`, `<nav>` for navigation, etc.).
- Use `role` attributes only when semantic HTML is insufficient.
- Images must have `alt` text (or `aria-hidden="true"` + `role="presentation"` for decorative).

#### 4f. Component Reusability

- Don't duplicate UI patterns. Extract a shared component when the same pattern appears twice.
- Keep components focused on one responsibility.
- Prefer controlled components (props in, callbacks out) over internal state mutation for reusable UI.

#### 4g. Dark Mode

- If the code touched by the diff includes dark-mode classes, ensure they follow the project's dark-mode convention.
- If the diff introduces new components and the project supports dark mode, add dark-mode support.
- If the project does not yet have dark mode, do not introduce dark-mode classes.

#### 4h. Loading, Empty, Error, Success States

Every new page or component should handle:

| State | Behavior |
|---|---|
| Loading | Skeleton or spinner with `role="status"` and `.sr-only` text |
| Empty | Informational message with guidance (e.g., "No products found.") |
| Error | User-friendly message with `role="alert"`, option to retry if appropriate |
| Success | Normal render with expected data |

#### 4i. Performance in UI

- Optimize images — use appropriate dimensions, lazy loading (`loading="lazy"`), and responsive `srcset` if available.
- Lazy-load components that are below the fold or triggered by user interaction.
- Avoid unnecessary DOM nesting — prefer CSS pseudo-elements or utility classes over wrapper divs.

### 5. Error Handling

- Every `async` function that performs a fallible operation (API call, storage access, file read, etc.) must wrap the operation in `try/catch`.
- Catch blocks must handle the error meaningfully — either surface it to the user, log it, or re-throw. Empty catch blocks (`catch {}`) are not allowed.
- API service functions (`src/services/`) should let errors propagate to the caller (the hook), which handles them — do not swallow errors silently in services.
- TanStack Query's `error` state should be used for API failures in components — do not duplicate error state in local `useState`.

#### 5a. Error Logging

- Log errors with enough context to debug: component name, operation attempted, and the error message.
- Never log sensitive data: auth tokens, passwords, PII, API keys, or raw request/response bodies that may contain them.
- In development, structured console output is acceptable (`console.error`). In production, route through a logging service.
- Log format: `[ComponentName] Failed to {operation}: {error.message}` — identifies origin without a stack trace in the UI.
- Include file and line number hints only in development logs — strip in production builds or use source maps internally.

#### 5b. Fallback UI

- Every Error Boundary must render a **user-friendly fallback component**, not a raw error message or stack trace.
- The fallback must:
  - Display a general message: "Something went wrong" (not the technical error).
  - Offer a **"Try Again"** button that resets the error boundary state.
  - Use the project's design tokens (neutral colors, proper spacing).
  - Be accessible: `role="alert"` on the container.
- Place Error Boundaries at logical section boundaries:
  - Wrap the product grid separately from the filter bar — a crash in one doesn't break the other.
  - Wrap each page's main content area independently.
  - A top-level boundary at `RootLayout` catches truly unexpected crashes but should not be the only boundary.

#### 5c. Error Modes to Cover

- **Network errors** — API unreachable, timeout, DNS failure.
- **Unexpected response shape** — API returns 200 but missing expected fields (validate with types, catch at service layer).
- **Rendering crashes** — caught by Error Boundary (null dereference, invalid props).
- **Async race conditions** — stale responses after filter change (TanStack Query handles this via query keys, but verify).

Never silently ignore any of these — every error mode must have a logged and user-visible outcome.

### 6. Code Quality

- No commented-out code in commits.
- No `console.log`, `debugger`, or `TODO` comments in committed code.
- File and folder names must follow existing conventions (`PascalCase` for components, `camelCase` for hooks/utils/services).
- Imports should be grouped: external → internal → types, with blank lines between groups.
- Functions should do one thing — if a function exceeds ~30 lines, consider extracting helpers.
- Avoid magic numbers/strings — extract named constants.

---

## Conventions Observed in This Codebase

(Discovered by reading existing source files — use as ground truth over general rules if conflict arises.)

| Convention | Source Example |
|---|---|
| Props typed as `interface` in component file | `ProductCard.tsx:4` |
| Exported via `components/index.ts` barrel | `components/index.ts` |
| Hooks return query results directly | `useProducts.ts` |
| API services return `axios` response `.data` | `product.service.ts` |
| Paths: `pages/` (route components), `components/` (reusable), `hooks/` (custom hooks), `services/` (API calls), `types/` (interfaces) | Directory structure |
| Loading/error states handled at page level, not component level | `Home.tsx` |
