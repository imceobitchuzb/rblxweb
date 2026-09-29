# Changelog — ROXIE HUB

All notable changes to the ROXIE HUB platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.6.0] - Phase 5.5: UX Shell, Command Palette, Notification Center, Landing Page & Documentation Polish

### Added
- **Marketing Landing Page (`/`)**:
  - High-converting Roblox creator landing page featuring value proposition, live pipeline metrics preview, visual 5-stage creator workflow roadmap, and 6-module interactive feature grid.
- **Global Multi-Entity Search (`components/search/GlobalSearch.tsx`, `lib/search-utils.ts`)**:
  - Unified search dialog indexing across Ideas, Characters, Screenplays, and Videos with real-time category grouped results, keyboard navigation, and direct routing.
- **Keyboard Command Palette (`components/command/CommandPalette.tsx`)**:
  - Power-user `Ctrl + K` / `Cmd + K` palette supporting instant route navigation and studio creation quick-actions with Escape/backdrop dismissal.
- **Notification Center (`components/notifications/NotificationCenter.tsx`, `lib/notification-utils.ts`)**:
  - Bell popover in TopNav deriving deterministic notifications from active records (scheduled releases, approved screenplays, viral ideas, premiere reminders) with unread counters and mark-as-read state.
- **Custom Error & 404 Pages**:
  - Cyber-themed 404 Not Found screen (`app/not-found.tsx`) and React Error Boundary (`app/error.tsx`) with recovery actions.
- **Reusable Loading Skeletons (`components/ui/Skeleton.tsx`)**:
  - Pulse animations for card grids, table rows, and page layouts.
- **Studio Settings (`app/settings/page.tsx`)**:
  - Profile configuration, appearance toggles, creator defaults, notification rules, and platform integration placeholders (marked for Phase 6+).
- **Unit Test Suite Expansion (`tests/shell-navigation.test.ts`)**:
  - 8 new unit tests covering multi-entity search, tag matching, slice limits, and notification derivation rules (total 66 passing tests).
- **Architecture & Technical Documentation (`docs/ARCHITECTURE.md`)**:
  - Comprehensive ASCII architecture diagram, component tree, domain model, and Phase 6 persistence migration strategy.

---

## [0.5.0] - Phase 5: Analytics & Creator Intelligence

### Added
- **Creator Intelligence Engine (`/analytics`, `lib/analytics-utils.ts`)**:
  - Multi-channel analytics aggregating YouTube, YouTube Shorts, TikTok, and Instagram Reels metrics.
  - Interactive time range filtering (`7D`, `30D`, `90D`, `ALL`) and platform breakdown.
  - Views By Date time-series calculation with chronological aggregation.
  - Publishing activity cadence tracking (published, scheduled, in production).
  - Character ROI leaderboard correlating character appearances with engagement.
  - Algorithmic creator insights identifying best formats, top characters, and production bottlenecks.
- **Unit Tests (`tests/analytics.test.ts`)**:
  - 15 unit tests covering statistical metrics, formatting helpers, and edge-case resilience.

---

## [0.4.0] - Phase 4: Video Studio & Content Calendar

### Added
- **Video Studio Pipeline (`/videos`, `lib/video-utils.ts`)**:
  - Comprehensive video tracking across 5 production stages (`SCRIPTED`, `RECORDING`, `EDITING`, `READY`, `SCHEDULED`, `PUBLISHED`).
  - Multi-platform support for YouTube, YouTube Shorts, TikTok, and Instagram Reels.
  - "Create Video from Script" factory function preserving relational links and character rosters.
- **Content Calendar (`/calendar`, `lib/calendar-utils.ts`)**:
  - Month and week interactive calendar views for release scheduling.
  - Relational synchronization linking scheduled videos directly to calendar events.
- **Unit Tests (`tests/videos.test.ts`, `tests/calendar.test.ts`)**:
  - 13 unit tests validating video state transitions, filtering, and calendar grid calculations.

---

## [0.3.0] - Phase 3: Character Roster & Script Studio

### Added
- **Character Roster (`/characters`, `lib/mock-characters.ts`)**:
  - Character dossier management with avatars, personalities, role classifications (`MAIN`, `SUPPORTING`, `VILLAIN`, `NPC`), outfits, and tags.
- **Script Studio (`/scripts`, `lib/mock-scripts.ts`)**:
  - Multi-scene screenplay editor with dialogue blocks, character assignment, emotion tags, and automated runtime calculation.
  - Cross-module "Convert Idea to Script" workflow.
- **Unit Tests (`tests/characters.test.ts`, `tests/scripts.test.ts`)**:
  - 13 unit tests verifying character CRUD, script validation, and cross-module relational lookups.

---

## [0.2.0] - Phase 2: Ideas Studio

### Added
- **Ideas Studio (`/ideas`, `lib/mock-ideas.ts`)**:
  - Dual-mode view: Interactive Kanban board and responsive card Grid.
  - Full search and filtering by Roblox category (`MM2`, `BEDWARS`, `BROOKHAVEN`, `DOORS`, `ANIME_DEFENDERS`, `TRENDS`), status, and priority (`HOT`, `MEDIUM`, `LOW`).
  - Create/edit modal with validation for viral potential score (1-10).
- **Unit Tests (`tests/ideas.test.ts`)**:
  - 13 unit tests covering search, tag parsing, status progressions, and CRUD state mutations.

---

## [0.1.0] - Phase 1: Foundation & Application Shell

### Added
- Next.js 14 App Router project setup with TypeScript strict mode and Tailwind CSS.
- Cyber/gaming dark UI design tokens, badges, buttons, cards, and input primitives.
- Top navigation, sidebar, and breadcrumbs with 8 active studio routes.
- Prepared Prisma ORM schema (`prisma/schema.prisma`) for future relational persistence.
- Initial unit test suite (`tests/architecture.test.ts`).
