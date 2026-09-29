# ROXIE HUB 🎮

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5.20-2D3748?style=for-the-badge&logo=prisma)
![Tests](https://img.shields.io/badge/Tests-66%20Passing-22C55E?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**The Modern Content-Management & Analytics Operating System for Roblox Creators**

[Explore Architecture](docs/ARCHITECTURE.md) • [View Changelog](CHANGELOG.md) • [Screenshots Guide](docs/screenshots/README.md)

</div>

---

## 🎯 Executive Overview

**ROXIE HUB** is a high-performance, production-quality creator operating system built specifically for Roblox gaming content creators and animation directors. It transforms chaotic video concepts into a structured, relational production pipeline:

```
+-----------------------------------------------------------------------------------------------+
|                                    ROBLOX CREATOR PIPELINE                                    |
|                                                                                               |
|  [ IDEAS STUDIO ] ──> [ SCRIPT STUDIO ] ──> [ VIDEO STUDIO ] ──> [ CALENDAR ] ──> [ANALYTICS] |
|   Viral Score (1-10)    Multi-Scene Script    Multi-Platform      Drop Schedule    Cross-Plat |
|   Kanban & Grid Board   Dialogue & Runtime    YouTube/TikTok      Month & Week     Insights   |
+-----------------------------------------------------------------------------------------------+
```

The system ensures complete relational integrity across the creator workflow:
- Brainstorm an **Idea** with viral potential ratings and tags.
- Convert that Idea into a structured **Screenplay** with character assignment and duration estimation.
- Advance the Screenplay into a **Video Production Asset** tracking thumbnails and edits.
- Place the Video directly on the **Publishing Calendar** to protect upload streaks.
- Evaluate real-world performance in **Creator Intelligence & Analytics**.

---

## ✨ Features & Modules

### 🚀 High-Converting Landing Page (`/`)
- Public marketing showcase featuring a dynamic hero section, live pipeline metrics, visual 5-stage creator workflow roadmap, and an interactive 6-module feature grid.

### 💡 Ideas Studio (`/ideas`)
- Dual-mode view: **Interactive Kanban Board** and responsive **Card Grid**.
- Filter by Roblox category (`MM2`, `BEDWARS`, `BROOKHAVEN`, `DOORS`, `ANIME_DEFENDERS`, `TRENDS`, `OTHER`).
- Track viral potential score (1-10), priority (`HOT 🔥`, `HIGH`, `MEDIUM`, `LOW`), and stage progression.
- One-click **"Convert to Script"** factory action with metadata inheritance.

### 🎭 Character Roster (`/characters`)
- Roblox avatar and persona library with avatars, roles (`MAIN`, `SUPPORTING`, `VILLAIN`, `NPC`), outfits, personalities, and acting notes.
- Reverse relational lookups displaying all screenplays and videos featuring each character.

### 📝 Screenplay Studio (`/scripts`)
- Professional 3-pane scriptwriting interface:
  - **Left**: Scene outline and reordering.
  - **Center**: Dialogue lines with character IDs, 8 emotion cues, and stage directions.
  - **Right**: Cast inspector and live runtime duration calculation (`mm:ss.s`).
- Dedicated video opening hook editor with real-time character count.

### 🎬 Video Studio (`/videos`)
- Multi-platform video production pipeline: **YouTube**, **YouTube Shorts**, **TikTok**, and **Instagram Reels**.
- Video stages: `PLANNING` → `IN_PRODUCTION` → `EDITING` → `READY` → `SCHEDULED` → `PUBLISHED`.
- Media preview player HUD, asset linking, and relational screenplay back-links.

### 📅 Content Calendar (`/calendar`)
- Monthly and weekly interactive timetable views.
- Schedule video drops, livestreams, and community posts.
- Direct synchronization with Video Studio publication statuses.

### 📊 Creator Intelligence & Analytics (`/analytics`)
- Mathematical analytics engine calculating Total Views, Average Views, Interaction Counts, and Engagement Rate `%`.
- Interactive time-range filtering (`7D`, `30D`, `90D`, `ALL`) and platform breakdown.
- Responsive Views-by-Date time-series curves.
- Character ROI leaderboard correlating character appearances with engagement.
- Automated algorithmic creator insights.

### ⌨️ Shell & Global Navigation
- **Command Palette (`Ctrl + K` / `Cmd + K`)**: Instant studio navigation and creator quick-actions.
- **Unified Global Search**: Multi-entity instant search indexing across Ideas, Characters, Scripts, and Videos.
- **Notification Center**: Bell popover in TopNav deriving deterministic notifications from active records.
- **Custom Error & 404 Screens**: Dark gaming themed error handling and recovery.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict typing mode, 0 errors) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) (Dark cyber/gaming design system) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database ORM** | [Prisma 5](https://www.prisma.io/) (Relational schema ready for PostgreSQL) |
| **Testing** | Node.js Test Runner + [tsx](https://github.com/privatenumber/tsx) (66 tests) |
| **Code Quality** | ESLint (`next/core-web-vitals`), Prettier-compatible conventions |

---

## 📂 Architecture & Directory Structure

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed technical specifications and component diagrams.

```text
rblxweb/
├── app/                      # Next.js 14 App Router
│   ├── page.tsx              # Marketing Landing Page
│   ├── layout.tsx            # Global layout shell (TopNav, Sidebar, CommandPalette)
│   ├── not-found.tsx         # Custom 404 screen
│   ├── error.tsx             # React Error Boundary
│   ├── dashboard/            # Executive overview & pipeline summary
│   ├── ideas/                # Ideas Studio (Grid / Kanban)
│   ├── characters/           # Character Roster & Dossiers
│   ├── scripts/              # Screenplay Studio & Scene Editor
│   ├── videos/               # Video Studio & Asset Pipeline
│   ├── calendar/             # Content Calendar & Timetable
│   ├── analytics/            # Creator Intelligence & Multi-Channel Engine
│   └── settings/             # Studio Preferences & Integrations
├── components/
│   ├── command/              # CommandPalette (Ctrl+K)
│   ├── search/               # Multi-Entity Global Search Modal
│   ├── notifications/        # NotificationCenter Popover
│   ├── layout/               # Sidebar, TopNav, Breadcrumbs
│   └── ui/                   # Button, Card, Badge, Input, Modal, Skeleton
├── docs/
│   ├── ARCHITECTURE.md       # Technical architecture specification
│   └── screenshots/          # UI screenshot guides & previews
├── lib/
│   ├── types.ts              # Domain TypeScript interfaces
│   ├── constants.ts          # Studio constants & navigation tokens
│   ├── search-utils.ts       # Global search engine
│   ├── notification-utils.ts # Deterministic notifications
│   ├── analytics-utils.ts    # Creator intelligence math formulas
│   ├── video-utils.ts        # Video pipeline operations
│   ├── script-utils.ts       # Script runtime calculations
│   └── calendar-utils.ts     # Calendar grid generation
├── prisma/
│   └── schema.prisma         # Prepared PostgreSQL relational schema
├── tests/                    # 66 comprehensive unit tests
│   ├── architecture.test.ts  # Route and design tokens tests
│   ├── ideas.test.ts         # Ideas Studio tests (13 tests)
│   ├── characters.test.ts    # Character Roster tests (6 tests)
│   ├── scripts.test.ts       # Script Studio tests (7 tests)
│   ├── videos.test.ts        # Video Studio tests (7 tests)
│   ├── calendar.test.ts      # Calendar tests (6 tests)
│   ├── analytics.test.ts     # Analytics engine tests (15 tests)
│   └── shell-navigation.test.ts # Search & notification tests (8 tests)
├── CHANGELOG.md              # Detailed release history
└── package.json
```

---

## 🧪 Verification & Testing

Every major domain feature is backed by isolated unit tests using pure functions:

```bash
# Run the complete test suite (66 tests)
npm test

# Run TypeScript strict type-check
npm run typecheck

# Run ESLint across app, components, lib, and tests
npm run lint

# Build production bundle
npm run build
```

---

## 🗺️ Product Roadmap

- [x] **Phase 1**: Foundation, Architecture, AppShell & Design System
- [x] **Phase 2**: Ideas Studio (Kanban & Grid, filters, CRUD)
- [x] **Phase 3**: Character Roster & 3-Pane Script Studio
- [x] **Phase 4**: Video Studio & Content Calendar Pipeline
- [x] **Phase 5**: Multi-Channel Analytics & Creator Intelligence
- [x] **Phase 5.5**: UX Shell, Global Search, Command Palette (Ctrl+K), Notification Center, Landing Page, Documentation
- [ ] **Phase 6**: PostgreSQL Persistence with Prisma Client & Server Actions
- [ ] **Phase 7**: Authentication & Multi-Creator Studio Workspaces
- [ ] **Phase 8**: Live YouTube Data API v3 & TikTok Creator API Integrations
- [ ] **Phase 9**: AI Assistant for Roblox Scriptwriting & Thumbnail Concepting

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
