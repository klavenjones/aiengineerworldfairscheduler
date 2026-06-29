# Migration Plan: Next.js Conference Agenda App → TanStack Start

## Context

The repo contains two projects:

- **Root** (`/`): TanStack Start scaffold with real JSON data (sessions.json, speakers.json, embeddings) but no UI built yet
- **`conference-agenda-app/`**: Next.js 16 app with fully-built UI (sidebar, list/grid/canvas views, filtering, starred sessions) but using fake deterministically-generated data

Goal: migrate the Next.js UI into the TanStack Start root project and replace the fake data with the real JSON data files already in `src/data/`.

---

## Key Data Model Differences to Bridge

| Aspect | Fake data (sessions.ts) | Real data (sessions.json) |
|--------|------------------------|--------------------------|
| Session time | `start`/`end` (minutes from midnight) + `startLabel`/`endLabel` | `time` string: `"9:00am - 10:45am"` |
| Day reference | `dayId`: `"day1"`, `"day2"` | `day`: full name e.g. `"Monday"` |
| Session ID | generated UUID | none (index-based needed) |
| Tags | `tags[]` (topic tags) | `track` string |
| Level | `"breakout"` \| `"expo"` | `type`: `"keynote"`, `"session"`, `"workshop"`, `"sponsor"` |
| Speaker | `name`, `role`, `company`, `socials[]` | `name`, `role`, `company`, `bio`, `linkedin`, `photoUrl` |

---

## Implementation Steps

### Step 1 — Add missing dependency

Add `@base-ui/react` to root `package.json` (present in conference-agenda-app but not root), then install.

```
pnpm add @base-ui/react
```

### Step 2 — Create data adapter (`src/lib/sessions.ts`)

This replaces the fake data generator. It:

1. Imports `sessions.json` and `speakers.json` from `src/data/`
2. Defines enriched TypeScript types (extending fake types with `description`, `bio`, `photoUrl`, `linkedin`)
3. Implements time parsing: `"9:00am - 10:45am"` → `{ start: 540, end: 645, startLabel: "9:00am", endLabel: "10:45am" }`
4. Maps day strings to dayIds using `DAYS` constant (Mon Jun 29 → `"day1"`, etc.)
5. Generates stable IDs from index + slugified title
6. Maps `track` → `tags` and session `type` → `level`
7. Exports: `SESSIONS`, `DAYS`, `TRACKS`, `TRACK_TAGS_BY_DAY`, `totalSessions()`

**Key parsing logic:**

```ts
// Time parse: "9:00am - 10:45am"
function parseTime(timeStr: string): { start: number; end: number; startLabel: string; endLabel: string }

// Day map: conference days are June 29–July 2, 2026
const DAY_MAP: Record<string, string> = {
  "Monday": "day1", "Tuesday": "day2", "Wednesday": "day3", "Thursday": "day4"
}

// Type → level map
const LEVEL_MAP: Record<string, "breakout" | "expo"> = {
  keynote: "breakout", session: "breakout", workshop: "breakout", sponsor: "expo"
}
```

### Step 3 — Port lib utilities (`src/lib/use-agenda.ts`)

Copy `conference-agenda-app/lib/use-agenda.ts` → `src/lib/use-agenda.ts`. No changes needed (localStorage hook is framework-agnostic).

### Step 4 — Port UI components (`src/components/`)

Copy and adapt these files from `conference-agenda-app/components/`:

| Source | Destination | Changes |
|--------|-------------|---------|
| `components/conference-app.tsx` | `src/components/conference-app.tsx` | Remove `"use client"`, fix import paths |
| `components/sidebar.tsx` | `src/components/sidebar.tsx` | Remove `"use client"`, fix import paths |
| `components/list-view.tsx` | `src/components/list-view.tsx` | Remove `"use client"`, fix import paths |
| `components/grid-view.tsx` | `src/components/grid-view.tsx` | Remove `"use client"`, fix import paths |
| `components/canvas-view.tsx` | `src/components/canvas-view.tsx` | Remove `"use client"`, fix import paths |
| `components/session-bits.tsx` | `src/components/session-bits.tsx` | Fix import paths, add `photoUrl` support to Avatar |
| `components/theme-provider.tsx` | `src/components/theme-provider.tsx` | Fix import paths |
| `components/ui/button.tsx` | `src/components/ui/button.tsx` | Copy as-is |

**Import path changes in every component:**

- `@/lib/sessions` → `#/lib/sessions`
- `@/lib/use-agenda` → `#/lib/use-agenda`
- `@/lib/utils` → `#/lib/utils`
- `@/components/...` → `#/components/...`

**`"use client"` directive**: TanStack Start doesn't use this directive — remove from all components.

### Step 5 — Update routes

**`src/routes/__root.tsx`** — Wrap Outlet with ThemeProvider:

```tsx
import { ThemeProvider } from '#/components/theme-provider'
// In body: <ThemeProvider><Outlet /></ThemeProvider>
```

**`src/routes/index.tsx`** — Replace placeholder with ConferenceApp:

```tsx
import { ConferenceApp } from '#/components/conference-app'
export function RouteComponent() {
  return <ConferenceApp />
}
```

### Step 6 — Merge styles

The root `src/styles.css` already has a complete design system. Merge any Tailwind directives or utilities from `conference-agenda-app/app/globals.css` that are not already present.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `package.json` | **Modify** — add `@base-ui/react` |
| `src/lib/sessions.ts` | **Create** — real data adapter |
| `src/lib/use-agenda.ts` | **Create** — port from Next.js app |
| `src/components/conference-app.tsx` | **Create** — port + adapt |
| `src/components/sidebar.tsx` | **Create** — port + adapt |
| `src/components/list-view.tsx` | **Create** — port + adapt |
| `src/components/grid-view.tsx` | **Create** — port + adapt |
| `src/components/canvas-view.tsx` | **Create** — port + adapt |
| `src/components/session-bits.tsx` | **Create** — port + adapt |
| `src/components/theme-provider.tsx` | **Create** — port + adapt |
| `src/components/ui/button.tsx` | **Create** — port as-is |
| `src/routes/__root.tsx` | **Modify** — add ThemeProvider |
| `src/routes/index.tsx` | **Modify** — render ConferenceApp |
| `src/styles.css` | **Modify** — merge missing globals |

---

## Critical Reuse (Do Not Recreate)

- `src/lib/utils.ts` — already has `cn()` utility
- `src/data/sessions.json` — 560 real sessions (the new data source)
- `src/data/speakers.json` — 539 real speakers (the new data source)
- `src/styles.css` — keep and extend, don't replace

---

## Verification

1. `pnpm run dev` — dev server starts without errors
2. `/` route renders ConferenceApp with real data (560 sessions, 539 speakers)
3. Session count in header matches real total (560)
4. Day filter works across all 4 conference days (Jun 29 – Jul 2)
5. List, Grid, and Canvas views all render sessions from real JSON
6. Search filters sessions by title and speaker name
7. Starring a session persists across page reload (localStorage)
8. Dark/light theme toggle works
9. No TypeScript errors (`tsc --noEmit`)
