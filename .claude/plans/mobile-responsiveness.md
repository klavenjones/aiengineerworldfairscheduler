# Mobile Responsiveness Plan

## Context
The app currently has a fixed desktop sidebar layout (w-72 or w-14 collapsed) that never hides on mobile. The reference images show a mobile-optimized layout where the sidebar is replaced by: a compact top header, a full-width search bar with a filter icon, horizontally scrollable day tabs, and a full-screen filter modal triggered by the filter icon.

---

## Layout Strategy

- **Desktop (md+)**: Existing layout unchanged — sidebar + main content side by side
- **Mobile (< md)**: Sidebar hidden, replaced by mobile-specific header + search bar + day tabs + filter modal

---

## Changes

### 1. `src/components/sidebar.tsx`
- Add `hidden md:flex` to both `<aside>` elements (expanded and collapsed states)
- No other changes needed

### 2. `src/components/conference-app.tsx`
- Add `mobileFiltersOpen` state (boolean)
- Add mobile-only header block using `md:hidden`:
  - **Row 1**: Logo box ("AI Engineer / World's Fair"), theme toggle, PDF icon, session count badge (`filtered.length`/`SESSIONS.length`), view switcher icons (List/Grid/Canvas), share icon
  - **Row 2**: Full-width search input + filter icon button that opens filter modal
  - **Row 3**: Horizontally scrollable day tab pills (mapped from DAYS, active = `selectedDayId`)
- Keep existing `<header>` but add `hidden md:flex` so it only shows on desktop
- Add mobile FAB: fixed bottom-right circle button with a left-arrow icon
- Render `<MobileFiltersSheet>` when `mobileFiltersOpen === true`

### 3. New `src/components/mobile-filters.tsx`
Full-screen filter modal for mobile:

**Props:** all filter state (search, setSearch, semantic, setSemantic, selectedTags, toggleTag, selectedDayId, setSelectedDayId, starredOnly, setStarredOnly, filteredCount, onClose)

**Layout:**
```
fixed inset-0 z-50 flex flex-col bg-background
├── Header row: "Filters" title + X close button
├── Scrollable body (flex-1 overflow-y-auto px-4):
│   ├── "Tracks" section heading
│   ├── Track search input (filters visible tag chips locally)
│   ├── Per-day collapsible sections with tag chip buttons
│   └── "Semantic search" checkbox
└── Sticky footer:
    └── "Show {filteredCount} sessions" golden CTA button (full width)
```

**Notes:**
- Track search is local state that filters visible tag chips
- Day sections are collapsible (default open), same pattern as sidebar TrackGroup
- Golden button uses `bg-primary text-primary-foreground` (matches existing token)

### 4. `src/components/list-view.tsx`
- Change `px-6` → `px-3 sm:px-6` on outer container for better mobile edge spacing
- Change `py-6` → `py-4 sm:py-6`

---

## Files to Modify
| File | Change |
|------|--------|
| `src/components/sidebar.tsx` | Add `hidden md:flex` to both aside elements |
| `src/components/conference-app.tsx` | Add mobile header, search bar, day tabs, filter state, FAB |
| `src/components/list-view.tsx` | Reduce mobile padding |

## File to Create
| File | Purpose |
|------|---------|
| `src/components/mobile-filters.tsx` | Full-screen filter modal |

---

## Verification
1. Run `pnpm run dev` and open on a mobile viewport (375px or DevTools device mode)
2. Verify: sidebar is hidden, mobile header shows with all icons
3. Verify: day tabs are horizontally scrollable, tapping one filters sessions
4. Verify: tapping filter icon opens full-screen filter modal
5. Verify: track chips in modal filter correctly, "Show X sessions" count updates dynamically
6. Verify: closing modal returns to list view with filters applied
7. Verify: desktop layout (>= 768px) is completely unchanged
8. Run `pnpm exec tsc --noEmit` to confirm no type errors
