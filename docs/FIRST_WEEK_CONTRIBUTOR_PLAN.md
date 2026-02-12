# EarnBurn First-Week Contributor Plan

This plan is for a newcomer who wants to make useful, low-risk contributions while learning the architecture.

## Prerequisites (Day 0)

1. Install dependencies:
   - `npm install`
2. Verify code health checks:
   - `npm run typecheck`
   - `npm run lint`
3. Run the app:
   - `npx expo start`

## Week Plan Overview

- **Day 1:** Understand app flow and architecture map.
- **Day 2:** Add light documentation and improve onboarding notes.
- **Day 3:** Add consistency checks around program planning semantics.
- **Day 4:** Improve typing and remove `any` in one feature path.
- **Day 5:** Ship one small behavior fix + one testable guard.

---

## Day 1 — Architecture Walkthrough (Read + Trace)

### Goals
- Understand startup path, route structure, and store initialization.
- Understand data model and repository boundaries.

### Read in this order
1. `README.md` (project purpose and stack)
2. `app/_layout.tsx` and `app/(tabs)/_layout.tsx` (boot + navigation)
3. `src/db/schema.ts`, `src/db/client.ts`, `src/db/migrations.ts` (persistence)
4. `src/store/*.ts` (global state)
5. `src/repositories/*.ts` (DB I/O)
6. `app/(tabs)/index.tsx`, `app/(tabs)/workout.tsx`, `app/(tabs)/profile.tsx` (main flows)

### Deliverable
- Personal notes: one page with “request path” traces:
  - Create Macrocycle
  - Add Mesocycle
  - Finish Workout

---

## Day 2 — Newcomer Docs Improvement (Easy Win)

### Task A: Expand `README.md` with “Architecture at a Glance”
- Add a concise section documenting:
  - UI routes (`app/`)
  - State (`src/store/`)
  - Repositories (`src/repositories/`)
  - DB schema and migrations (`src/db/`, `drizzle/`)

### Task B: Add “How to add a new screen” mini-guide
- Explain adding a route in `app/` and using `AppScreen` + theme tokens.

### Acceptance Criteria
- New contributor can run the app and identify where to implement a feature.
- README includes at least one end-to-end flow diagram in bullet form.

---

## Day 3 — Planning Consistency Audit (Low-risk, high-value)

### Problem to investigate
There are mixed assumptions around mesocycle deload behavior and week counts.

### Tasks
1. Document current behavior in code comments/docs:
   - UI plan renders `meso.weeks + 1` (last week as deload).
   - Repository inserts microcycles for `w < meso.weeks`.
2. Add a small `docs/planning-consistency.md` note with:
   - Current behavior
   - Desired canonical behavior
   - Migration considerations

### Acceptance Criteria
- Team has written agreement target before refactor.
- No runtime behavior changes yet.

---

## Day 4 — Type Safety Improvement Ticket

### Candidate ticket
Replace `any` usage in one analytics path with typed interfaces:
- `app/(tabs)/index.tsx` analytics state currently uses broad arrays.
- Introduce local typed view models based on `AnalyticsService` return shapes.

### Why this is good for week 1
- Constrained scope
- Immediate maintainability gain
- Low migration risk

### Acceptance Criteria
- No `any` in touched analytics path.
- `npm run typecheck` passes.

---

## Day 5 — Small Behavior Fix + Guardrails

### Candidate fix
Improve robustness when saving workouts:
- Validate set data before insert (e.g., non-negative reps/weight).
- Avoid silent bad writes for malformed text input.

### Candidate guardrail
- Add utility function (pure TS) for set normalization and test it.

### Acceptance Criteria
- Clear user feedback when invalid set input exists.
- Normal save flow unaffected for valid data.

---

## Suggested First 5 Issues to Open/Claim

1. **Docs:** Add architecture map + contributor onboarding section to README.
2. **Docs:** Add planning consistency decision record (`docs/planning-consistency.md`).
3. **Refactor:** Replace analytics `any` with typed models.
4. **Validation:** Add set input normalization helper and wire into workout save path.
5. **Cleanup:** Remove dead comments and align Mesocycle type/repository fields.

---

## Working Agreements for New Contributors

- Keep PRs small (<250 changed lines if possible).
- Touch one subsystem at a time (UI, store, repository, or DB).
- If schema changes are required:
  1. Update `src/db/schema.ts`
  2. Generate/apply migration in `drizzle/`
  3. Validate app startup migration path
- Use existing theme tokens from `src/theme/theme.ts`; avoid hard-coded colors unless intentional.

---

## Definition of Done (Week 1)

By end of week 1, a contributor should be able to:
- Run the app locally and navigate all major flows.
- Explain startup migration/init behavior.
- Make one documentation PR and one small code PR.
- Identify at least one consistency issue and propose a safe implementation path.
