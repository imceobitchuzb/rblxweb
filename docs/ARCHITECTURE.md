# ROXIE HUB — Architecture & Engineering Specification

## 1. System Overview

ROXIE HUB is an enterprise-grade creator intelligence and production workflow platform tailored specifically for Roblox gaming content creators. It bridges the gap between chaotic video concept ideation and multi-channel publication metrics.

```
+---------------------------------------------------------------------------------------+
|                                    ROXIE HUB SHELL                                    |
|                                                                                       |
|  +--------------------+  +---------------------------------------------------------+  |
|  |      SIDEBAR       |  |                         TOPNAV                          |  |
|  |                    |  |  [Global Search Ctrl+K]  [Notifications]  [User Profile]|  |
|  |  * Studio / Ideas  |  +---------------------------------------------------------+  |
|  |  * Characters      |                                                               |
|  |  * Scripts         |  +---------------------------------------------------------+  |
|  |  * Videos          |  |                   DYNAMIC ROUTE VIEW                    |  |
|  |  * Calendar        |  |                                                         |  |
|  |  * Analytics       |  |   /dashboard   /ideas   /characters   /scripts          |  |
|  |  * Settings        |  |   /videos      /calendar              /analytics        |  |
|  +--------------------+  +---------------------------------------------------------+  |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                                APPLICATION DOMAIN LAYER                                |
|                                                                                       |
|   +-------------------+  +-------------------+  +-------------------+                 |
|   | search-utils.ts   |  | notif-utils.ts    |  | analytics-utils.ts|                 |
|   | (Multi-Entity)    |  | (Deterministic)   |  | (Metrics Engine)  |                 |
|   +-------------------+  +-------------------+  +-------------------+                 |
|   +-------------------+  +-------------------+  +-------------------+                 |
|   | calendar-utils.ts |  | video-utils.ts    |  | script-utils.ts   |                 |
|   | (Grid & Events)   |  | (Workflow Engine) |  | (Runtime & Scene) |                 |
|   +-------------------+  +-------------------+  +-------------------+                 |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                               CROSS-MODULE DATA MODEL                                 |
|                                                                                       |
|     +-------------+          +-------------+          +-------------+                 |
|     |  IdeaItem   | -------> |   Script    | -------> |    Video    |                 |
|     | (Viral Pot) | ideaId   | (Screenplay)| scriptId | (Multi-Plat)|                 |
|     +-------------+          +-------------+          +-------------+                 |
|            |                        |                        |                        |
|            v                        v                        v                        |
|     +-------------+          +-------------+          +-------------+                 |
|     |  Character  | <--------+             | <--------+             |                 |
|     |  (Dossier)  |    characterIds        |    characterIds        |                 |
|     +-------------+                        |                        |                 |
|                                            |                        v                 |
|                                            |                 +---------------+        |
|                                            +---------------> | CalendarEvent |        |
|                                                              +---------------+        |
|                                                                     |                 |
|                                                                     v                 |
|                                                              +---------------+        |
|                                                              |   Analytics   |        |
|                                                              +---------------+        |
+---------------------------------------------------------------------------------------+
                                           |
                   +-----------------------+-----------------------+
                   | (Phases 1 - 5.5)                              | (Phase 6 Roadmap)
                   v                                               v
        +----------------------+                       +-----------------------+
        | In-Memory Typed Mock |                       | Prisma ORM Client     |
        | State Architecture   |                       | PostgreSQL Database   |
        +----------------------+                       +-----------------------+
```

---

## 2. Creator Workflow Lifecycle

ROXIE HUB executes an end-to-end continuous loop for Roblox creators:

1. **IDEA (`/ideas`)**
   - Concept capture with viral potential rating (1-10), target category, tags, and priority.
   - Status evolves: `IDEA` -> `SCRIPTING` -> `FILMING` -> `EDITING` -> `PUBLISHED`.
   - "Convert to Script" factory function seeds screenplay with full metadata inheritance.

2. **CHARACTERS (`/characters`)**
   - Central character roster tracking avatars, personalities, outfits, and dialogue tropes.
   - Referenced across both screenplays and published videos.

3. **SCRIPTS (`/scripts`)**
   - Screenplay Studio supporting multi-scene breakdowns, character assignment, dialogue duration estimation, and stage directions.
   - Computes total runtime automatically. "Advance to Video" converts approved scripts into video production items.

4. **VIDEOS (`/videos`)**
   - Production hub tracking YouTube, YouTube Shorts, TikTok, and Instagram Reels content.
   - Manages assets, thumbnails, runtimes, and links back to the originating script and idea.

5. **CALENDAR (`/calendar`)**
   - Monthly and weekly grid scheduling releases, livestreams, community posts, and recording sessions.
   - Synchronized with video statuses (`READY` -> `SCHEDULED` -> `PUBLISHED`).

6. **ANALYTICS (`/analytics`)**
   - Cross-platform analytics calculating Total Views, Engagement Rates, Best Formats, Top Performing Characters, and Cadence Trends.
   - Generates actionable algorithmic creator insights.

---

## 3. Component Hierarchy

```
app/
├── layout.tsx (Root layout with TopNav, Sidebar, CommandPalette, GlobalSearch)
├── page.tsx (Marketing Landing Page)
├── not-found.tsx (404 Error Screen)
├── error.tsx (React Error Boundary)
├── dashboard/
│   └── page.tsx (Executive overview, KPI metrics, recent activity, quick actions)
├── ideas/
│   └── page.tsx (Ideas Studio: Grid/Kanban views, filters, creator modal)
├── characters/
│   └── page.tsx (Character Roster: Dossier cards, filter by role, character modal)
├── scripts/
│   └── page.tsx (Script Studio: Screenplay editor, scene cards, dialogue builder)
├── videos/
│   └── page.tsx (Video Studio: Production pipeline, filter by platform & status)
├── calendar/
│   └── page.tsx (Content Calendar: Month/Week views, release slotting modal)
├── analytics/
│   └── page.tsx (Creator Intelligence: KPI grids, time series, platform breakdown)
└── settings/
    └── page.tsx (Studio preferences, notification rules, platform connections)
```

---

## 4. Pure Business Logic & Testability

All state calculation, transformation, filtering, and formatting is isolated in pure TypeScript functions under `lib/`:

| Module | Source File | Test File | Test Count |
|---|---|---|---|
| Architecture & Constants | `lib/constants.ts`, `lib/types.ts` | `tests/architecture.test.ts` | 4 tests |
| Ideas Studio Engine | `lib/mock-ideas.ts` | `tests/ideas.test.ts` | 13 tests |
| Character Roster Engine | `lib/mock-characters.ts` | `tests/characters.test.ts` | 6 tests |
| Script Studio Engine | `lib/mock-scripts.ts` | `tests/scripts.test.ts` | 7 tests |
| Video Studio Engine | `lib/video-utils.ts` | `tests/videos.test.ts` | 7 tests |
| Calendar Engine | `lib/calendar-utils.ts` | `tests/calendar.test.ts` | 6 tests |
| Analytics & Insights Engine | `lib/analytics-utils.ts` | `tests/analytics.test.ts` | 15 tests |
| Shell, Search & Notifications | `lib/search-utils.ts`, `lib/notification-utils.ts` | `tests/shell-navigation.test.ts` | 8 tests |
| **Total** | | | **66 tests** |

---

## 5. Phase 6 Persistence Roadmap (PostgreSQL + Prisma)

The repository includes a ready-to-migrate `prisma/schema.prisma` file containing relational models for `User`, `Idea`, `Character`, `Script`, `Scene`, `Dialogue`, `Video`, `CalendarEvent`, and `AnalyticsSnapshot`.

### Migration Strategy:
1. **Containerized DB**: Spin up local PostgreSQL instance via Docker or Supabase/Neon serverless DB.
2. **Prisma Client Generation**: Run `prisma migrate dev` to generate tables matching the existing TypeScript interfaces.
3. **Repository Pattern / API Route Handlers**: Implement Next.js App Router Route Handlers (`app/api/...`) that return data matching the existing `types.ts` schemas.
4. **Zero-UI Breaking Changes**: Because UI components consume standard types (`IdeaItem`, `Character`, `Script`, `Video`, `CalendarEvent`), migrating to database-backed SWR/React Query hooks will require zero alterations to the presentation components.
