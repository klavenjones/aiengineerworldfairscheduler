# Project Analysis: AI Engineer World's Fair Scheduler

**Analyzed:** 2026-06-29
**Repository:** `aiengineerworldfairscheduler`

---

## Overview

This project is a conference schedule/agenda application for the **AI Engineer World's Fair 2026**. It is in early scaffolding stage — the data layer and tooling are well-defined, but the actual UI has not been built yet.

The repo contains **two separate front-end projects** that appear to represent two different approaches or iterations:

| | Root Project | `conference-agenda-app/` |
|---|---|---|
| Framework | TanStack Start (SSR) | Next.js 16.2.6 |
| React | 19.2.0 | 19.x |
| TypeScript | 6.0.x | 5.7.3 |
| Styling | Tailwind CSS 4 + shadcn | Tailwind CSS 4 + shadcn |
| Server | Nitro (nightly) | Next.js built-in |
| Status | Boilerplate scaffold | No source files found |

---

## Source File Inventory

### Root Project (`src/`)

```
src/
  data/
    sessions.json          # Full conference session data (very large)
    speakers.json          # Full speaker profile data (very large)
    speakers-embeddings.json  # Vector embeddings (AI semantic search)
    mcp.json               # MCP server tool definitions
  routes/
    __root.tsx             # Root layout with TanStack devtools
    index.tsx              # Placeholder "Test Page" only
  lib/
    utils.ts               # cn() utility (clsx + tailwind-merge)
  router.tsx               # TanStack Router setup
  routeTree.gen.ts         # Auto-generated route tree (only "/" exists)
  styles.css               # Full design system + dark mode tokens
```

### Conference Agenda App (`conference-agenda-app/`)

Only config files found — no actual source files:
- `package.json`, `tsconfig.json`, `components.json`, `postcss.config.mjs`
- This sub-project appears abandoned or not yet started.

---

## Tech Stack (Root Project)

### Core
- **TanStack Start** — SSR framework built on TanStack Router
- **React 19** — latest stable
- **Vite 8** — build tool
- **Nitro (nightly)** — server adapter for deployment
- **TypeScript 6.0** — cutting-edge, not yet stable

### UI
- **Tailwind CSS 4** — with `@tailwindcss/vite` plugin
- **shadcn/ui** — component library (radix-luma style, taupe base color)
- **Radix UI** — primitive components
- **Lucide React** — icons
- **Inter Variable** — primary font (via `@fontsource-variable/inter`)
- **Fraunces** — display/heading font (via Google Fonts)

### Testing
- **Vitest** — test runner
- **@testing-library/react** — component testing
- **jsdom** — browser simulation

### Developer Tooling
- **pnpm** — package manager
- **TanStack Router Devtools** — embedded in root layout
- **TanStack Devtools** — embedded in root layout

---

## Data Layer

The data layer is the most complete part of the project.

### `sessions.json`
A large dataset of all conference sessions including titles, descriptions, speakers, times, rooms, tracks, and session types (keynote, session, workshop, sponsor).

### `speakers.json`
A large dataset of speaker profiles including names, roles, companies, bios, and social links.

### `speakers-embeddings.json`
Pre-computed vector embeddings for all speakers — indicates that **AI-powered semantic search** is planned or partially implemented.

### `mcp.json`
Defines an MCP (Model Context Protocol) server named `aie-worldsfair-2026` with four tools:

| Tool | Description |
|---|---|
| `get_conference_info` | Returns dates, location, venue, and links |
| `list_speakers` | Lists speakers with optional search filter |
| `list_sessions` | Lists sessions with filters for day, type, track, or search |
| `get_schedule` | Returns full schedule organized by day |

This MCP server makes the conference data accessible to AI agents and LLM tools directly.

---

## Design System

The CSS (`src/styles.css`) establishes a polished, ocean/nature-themed design system with full dark mode support:

### Custom Tokens (Light)
| Token | Value |
|---|---|
| `--sea-ink` | `#173a40` (dark teal, primary text) |
| `--lagoon` | `#4fb8b2` (teal accent) |
| `--palm` | `#2f6a4a` (green) |
| `--sand` | `#e7f0e8` (light background) |
| `--foam` | `#f3faf5` (lighter background) |

### Features
- Full dark mode with `.dark` class
- Complex radial gradient hero background
- Subtle grid overlay via `body::after`
- Custom CSS utility classes: `.island-shell`, `.feature-card`, `.nav-link`, `.rise-in`, `.display-title`, `.island-kicker`, `.page-wrap`
- Smooth transitions on interactive elements (180ms ease)
- `rise-in` entrance animation

---

## Current Application State

### What exists
- Full project scaffolding and tooling
- Complete design system in CSS
- Conference data in JSON
- MCP server definition
- TanStack Router configured with SSR
- shadcn/ui configured

### What is missing (not yet built)
- Any actual UI components or pages (only a "Test Page" placeholder at `/`)
- Navigation/header/footer components
- Session listing/filtering views
- Speaker listing/profile views
- Schedule view (by day, track, or room)
- Search functionality (despite embeddings data being present)
- Data loading (no loaders, no server functions consuming the JSON files)
- No shadcn components installed yet (only `cn()` utility exists)

---

## Issues & Observations

### Structural
1. **Dual project problem** — Two separate frameworks (`TanStack Start` at root, `Next.js` in `conference-agenda-app/`) exist in the same repo. The `conference-agenda-app/` has no source files and appears to be either abandoned or a scaffold that was never started. This should be resolved: pick one or document the intent clearly.

2. **No `.gitignore` at root properly covering both projects** — The root `.gitignore` exists but the `conference-agenda-app/` has its own `.gitignore`. The repo has no commits yet, meaning both `node_modules` directories are currently untracked.

3. **No git commits** — The project has never been committed. All files are untracked.

### Dependency Risks
4. **Unpinned "latest" dependencies** — Several TanStack packages use `latest` instead of specific versions:
   ```json
   "@tanstack/react-devtools": "latest",
   "@tanstack/react-router": "latest",
   "@tanstack/react-router-devtools": "latest",
   "@tanstack/react-router-ssr-query": "latest",
   "@tanstack/react-start": "latest"
   ```
   This can cause unexpected breaking changes on fresh installs.

5. **Nitro nightly build** — `"nitro": "npm:nitro-nightly@latest"` uses an unstable nightly build. This may cause instability or breaking changes.

6. **TypeScript 6.0** — Still in pre-release/cutting-edge territory. Some tooling may not fully support it yet.

### Code Quality
7. **Duplicate CSS import** — `tw-animate-css` is imported twice in `src/styles.css` (lines 5 and 7).

8. **No linting in root project** — No ESLint or Biome configuration exists at the root. The `conference-agenda-app/` has ESLint via Next.js, but the main app does not.

9. **TanStack Devtools in production layout** — The root layout (`__root.tsx`) embeds `TanStackDevtools` and `TanStackRouterDevtoolsPanel` without any environment guard. These will be included in production builds unless conditionally removed.

10. **Page title not updated** — The root layout still uses the default `TanStack Start Starter` as the page title.

---

## Recommendations

### Immediate
- [ ] Make an initial git commit to establish a baseline
- [ ] Remove or integrate `conference-agenda-app/` — decide on one framework
- [ ] Fix the duplicate `tw-animate-css` import in `styles.css`
- [ ] Guard devtools behind `import.meta.env.DEV` in `__root.tsx`
- [ ] Pin TanStack package versions after verifying compatibility
- [ ] Replace `nitro-nightly` with a stable Nitro release when available
- [ ] Update the page title from the default starter value

### Short-term (Building the App)
- [ ] Install shadcn components needed for the UI (cards, tabs, badges, inputs, etc.)
- [ ] Create data loaders that read from `sessions.json` and `speakers.json`
- [ ] Build the schedule view — core feature of the app
- [ ] Build the speakers directory
- [ ] Add route-level search/filtering using the existing embeddings data
- [ ] Add a header/nav with links between views

### Longer-term
- [ ] Implement semantic search using `speakers-embeddings.json`
- [ ] Add ESLint to the root project
- [ ] Write tests for data utilities and key components
- [ ] Configure deployment (the MCP server suggests this may need a backend)

---

## Summary

The project has a strong foundation: a well-thought-out data model, a complete and polished design system, MCP server tooling for AI integration, and modern framework choices. However, virtually no application UI has been built. The most important next step is choosing a single framework (TanStack Start or Next.js), then building out the schedule, sessions, and speakers views on top of the existing data and design system.
