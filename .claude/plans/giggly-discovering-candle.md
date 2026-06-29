# Plan: Session Detail Modal

## Context
Users want to click on any session card (in List, Grid, or Canvas view) and see a rich detail modal with full session info — matching the reference screenshot showing title, track/room, date/time, topic tags, speaker card with bio, session description, and a favorite toggle button.

There is currently no modal or dialog component in the codebase. The `StarButton`, `Avatar`, and `SocialLinks` components in `session-bits.tsx` can be reused. The `useAgenda` hook already manages favorites state.

---

## Implementation Plan

### 1. Create `src/components/session-modal.tsx`
New component using native `<dialog>` element (`showModal()` / `close()`), which provides built-in focus trapping, backdrop, and `Escape` key handling — no new dependencies needed.

**Modal sections (top to bottom):**
- **Header:** "Session Details" label + `×` close button
- **Title:** `session.title` (large, semibold)
- **Track/Room row:** Building icon + `{session.track} / Room {session.roomNumber}` + optional "View Map →" link
- **Date/Time row:** Calendar icon + `{day label} · {startLabel}–{endLabel}`
- **Divider**
- **Tags:** Pill badges for each `session.tags[]` item
- **Speaker card(s):** For each speaker:
  - `Avatar` (photo or initials)
  - Name (bold, primary color) + Role · Company
  - `SocialLinks`
  - Bio (truncated at ~3 lines with "Read more…" expand toggle)
- **Description:** `session.description` full text (scrollable)
- **Footer:** Full-width `★ Add to Favorites` / `★ Remove from Favorites` button

Props:
```ts
{ session: Session | null; starred: boolean; onToggle: () => void; onClose: () => void }
```

Close triggers: X button, backdrop click (click on `<dialog>` outside content), Escape key (native).

### 2. Update `src/components/conference-app.tsx`
- Add `const [selectedSession, setSelectedSession] = useState<Session | null>(null)`
- Render `<SessionModal>` with the selected session, starred state, and handlers
- Pass `onSessionClick={(s) => setSelectedSession(s)}` down to all three views

**File:** `src/components/conference-app.tsx`

### 3. Update `src/components/list-view.tsx`
- Add `onSessionClick: (s: Session) => void` prop to `SessionRow` and parent component
- Add `onClick={() => onSessionClick(session)}` to the session card container
- Keep `StarButton`'s `stopPropagation` so clicking star doesn't open modal

**File:** `src/components/list-view.tsx`

### 4. Update `src/components/grid-view.tsx`
- Add `onSessionClick: (s: Session) => void` prop to `GridCell` and parent
- Add `onClick={() => onSessionClick(session)}` to the cell container
- Keep `StarButton`'s `stopPropagation`

**File:** `src/components/grid-view.tsx`

### 5. Update `src/components/canvas-view.tsx`
- Add `onSessionClick: (s: Session) => void` prop
- Change the session button `onClick` from `toggle(s.id)` to `onSessionClick(s)`
- StarButton still handles starring independently inside each block

**File:** `src/components/canvas-view.tsx`

---

## Key Files
- `src/components/session-modal.tsx` — **new file**
- `src/components/conference-app.tsx` — add state + render modal + pass prop
- `src/components/list-view.tsx` — add click handler prop
- `src/components/grid-view.tsx` — add click handler prop
- `src/components/canvas-view.tsx` — add click handler prop
- `src/components/session-bits.tsx` — reuse `Avatar`, `SocialLinks` (read-only)
- `src/lib/sessions.ts` — reference for `Session` and `Speaker` types (read-only)
- `src/lib/use-agenda.ts` — `isStarred(id)` and `toggle(id)` (read-only)

---

## Reuse
- `Avatar` from `session-bits.tsx` — speaker photo/initials
- `SocialLinks` from `session-bits.tsx` — X, LinkedIn, web icons
- `useAgenda` hook already called in `conference-app.tsx` — pass `isStarred` + `toggle` down

---

## Verification
1. Run `pnpm run dev`, open browser at localhost:3000
2. In List View: click a session card → modal opens with full details
3. In Grid View: click a cell → modal opens
4. In Canvas View: click a session block → modal opens
5. Verify: clicking `★ Add to Favorites` updates the star state and sidebar count
6. Verify: clicking backdrop or pressing Escape closes the modal
7. Verify: modal is scrollable for sessions with long descriptions
8. Run `pnpm exec tsc --noEmit` — no type errors
