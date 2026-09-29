# ROXIE HUB 🎮

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5.20-2D3748?style=for-the-badge&logo=prisma)
![Tests](https://img.shields.io/badge/Tests-128%20Passing-22C55E?style=for-the-badge&logo=node.js)
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

### 🏢 Creator Workspace & Collaboration (`/settings?tab=workspace`)
- Multi-workspace switcher with instantaneous JWT re-signing and secure cookie updates.
- Role-based team management (`OWNER`, `ADMIN`, `MEMBER`) with role escalation defense.
- Cryptographically secure 64-char invitation links (SHA-256 hashed storage, 7-day expiry).
- Scoped and sanitized workspace audit log stream with automatic secret scrubbing.
- User profile management with avatar validation, bio length limits, and IANA timezone normalization.

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
| **Authentication** | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) + [jose](https://github.com/panva/jose) (Signed JWT sessions, HTTP-only cookies) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database ORM** | [Prisma 5](https://www.prisma.io/) (Relational schema ready for PostgreSQL) |
| **Testing** | Node.js Test Runner + [tsx](https://github.com/privatenumber/tsx) (128 tests passing) |
| **Code Quality** | ESLint (`next/core-web-vitals`), Prettier-compatible conventions |

---

## 📂 Architecture & Directory Structure

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed technical specifications and component diagrams.

```text
rblxweb/
├── app/                      # Next.js 14 App Router
│   ├── page.tsx              # Marketing Landing Page
│   ├── layout.tsx            # Global layout shell (TopNav, Sidebar, CommandPalette)
│   ├── login/                # Sign In page (/login)
│   ├── register/             # User & Workspace Registration (/register)
│   ├── forbidden/            # 403 Access Restricted page (/forbidden)
│   ├── not-found.tsx         # Custom 404 screen
│   ├── error.tsx             # React Error Boundary
│   ├── dashboard/            # Executive overview & pipeline summary
│   ├── ideas/                # Ideas Studio (Grid / Kanban)
│   ├── characters/           # Character Roster & Dossiers
│   ├── scripts/              # Screenplay Studio & Scene Editor
│   ├── videos/               # Video Studio & Asset Pipeline
│   ├── calendar/             # Content Calendar & Timetable
│   ├── analytics/            # Creator Intelligence & Multi-Channel Engine
│   └── settings/             # Studio Preferences, Profile & Workspace Config
├── middleware.ts             # Edge route protection & JWT verification
├── components/
│   ├── auth/                 # AuthCard, LoginForm, RegisterForm
│   ├── command/              # CommandPalette (Ctrl+K)
│   ├── search/               # Multi-Entity Global Search Modal
│   ├── notifications/        # NotificationCenter Popover
│   ├── layout/               # Sidebar, TopNav (with User & Workspace Switcher), Breadcrumbs
│   └── ui/                   # Button, Card, Badge, Input, Modal, Skeleton
├── docs/
│   ├── ARCHITECTURE.md       # Technical architecture specification
│   └── screenshots/          # UI screenshot guides & previews
├── lib/
│   ├── types.ts              # Domain TypeScript interfaces & Auth/Workspace types
│   ├── constants.ts          # Studio constants & navigation tokens
│   ├── auth/                 # Authentication & authorization subsystem
│   │   ├── password.ts       # bcryptjs hashing and verification
│   │   ├── session.ts        # jose signed JWT tokens & cookie management
│   │   ├── context.ts        # Session and active workspace resolver
│   │   └── permissions.ts    # Role-based access control (OWNER, ADMIN, MEMBER)
│   ├── search-utils.ts       # Global search engine
│   ├── notification-utils.ts # Deterministic notifications
│   ├── analytics-utils.ts    # Creator intelligence math formulas
│   ├── video-utils.ts        # Video pipeline operations
│   ├── script-utils.ts       # Script runtime calculations
│   ├── calendar-utils.ts     # Calendar grid generation
│   ├── prisma.ts             # Prisma client singleton & connection tester
│   └── server/               # Server-side data access & validation
│       ├── workspaces.ts     # Multi-tenant workspace switcher & membership
│       ├── invitations.ts    # Cryptographic SHA-256 invitation lifecycle
│       ├── audit.ts          # Sanitized immutable workspace audit logger
│       ├── profile.ts        # User profile & timezone normalization
│       ├── dashboard.ts      # Workspace-scoped metrics & empty states
│       ├── search.ts         # Workspace-scoped multi-entity search
│       ├── ideas.ts          # Ideas persistence (workspace-scoped)
│       ├── characters.ts     # Character persistence & dependency guards
│       ├── scripts.ts        # Screenplays & scene hierarchy
│       ├── videos.ts         # Video asset persistence
│       ├── calendar.ts       # Calendar drop scheduling
│       ├── analytics.ts      # Database-driven analytics feeder
│       ├── validation.ts     # Server input validation rules
│       ├── store.ts          # Offline multi-tenant development fallback store
│       └── user-context.ts   # User & Workspace Context abstraction
├── app/actions/              # Next.js Server Actions ("use server")
│   ├── auth.ts               # Registration, Login, Logout actions
│   ├── workspace.ts          # Workspace switching, members & roles
│   ├── invitations.ts        # Invitation generation, acceptance & revocation
│   ├── profile.ts            # User profile mutations
│   ├── dashboard.ts          # Workspace dashboard data fetcher
│   ├── search.ts             # Workspace-scoped search action
│   ├── audit.ts              # Workspace audit logs fetcher
│   ├── ideas.ts              # Idea CRUD actions
│   ├── characters.ts         # Character CRUD actions
│   ├── scripts.ts            # Screenplay & scene CRUD actions
│   ├── videos.ts             # Video CRUD actions
│   ├── calendar.ts           # Calendar scheduling actions
│   └── settings.ts           # Studio configuration actions
├── prisma/
│   ├── schema.prisma         # Production PostgreSQL multi-tenant relational schema
│   └── seed.ts               # Production demo database seeder
├── tests/                    # 128 comprehensive automated tests
│   ├── architecture.test.ts  # Route and design tokens tests (4 tests)
│   ├── ideas.test.ts         # Ideas Studio tests (12 tests)
│   ├── characters.test.ts    # Character Roster tests (6 tests)
│   ├── scripts.test.ts       # Script Studio tests (7 tests)
│   ├── videos.test.ts        # Video Studio tests (7 tests)
│   ├── calendar.test.ts      # Calendar tests (6 tests)
│   ├── analytics.test.ts     # Analytics engine tests (16 tests)
│   ├── shell-navigation.test.ts # Search & notification tests (8 tests)
│   ├── database.test.ts      # Persistence, validation & cascade tests (11 tests)
│   ├── auth.test.ts          # Password hashing, JWT & auth action tests (12 tests)
│   ├── authorization.test.ts # Multi-tenant isolation & permissions tests (5 tests)
│   ├── workspaces.test.ts    # Workspace membership, switching & profiles (17 tests)
│   └── invitations-audit.test.ts # Cryptographic invites, audit & tenant search (17 tests)
├── CHANGELOG.md              # Detailed release history
└── package.json
```

---

## 🗄️ Persistence Architecture

ROXIE HUB uses a modern, multi-tier full-stack persistence architecture:

```
[ Browser / Client ]
        │
        ▼ (Next.js Server Actions)
[ app/actions/*.ts ]
        │
        ▼ (Input Validation & Scoped Queries)
[ lib/server/*.ts ]
        │
        ▼ (PrismaClient Singleton)
[ Prisma ORM ]
        │
        ▼
[ PostgreSQL Database ]
```

### Relational Features:
- **Cascading Deletions**: Deleting a `Script` cascades to `Scene`, which cascades to `DialogueLine` records.
- **Dependency Protection**: Deleting a `Character` is guarded by `onDelete: Restrict`; if the character is referenced by existing screenplays, deletion is blocked with an actionable error.
- **Indexed Fields**: High-throughput fields (`userId`, `workspaceId`, `status`, `category`, `platform`, `publishedAt`, `scheduledAt`, `tokenHash`) are indexed for sub-millisecond lookups.
- **Offline Development Resilience**: When PostgreSQL is offline or during static site generation (`next build`), `lib/server/store.ts` provides a deterministic development fallback store, ensuring zero development downtime.

### Database CLI Commands:

```bash
# Validate Prisma schema syntax
npx prisma validate

# Generate Prisma Client types
npx prisma generate

# Create and apply migrations (requires PostgreSQL)
npx prisma migrate dev --name phase_8_creator_workspace_collaboration

# Seed database with complete creator demo records
npx prisma db seed

# Open interactive visual database browser
npx prisma studio
```

---

## 🧪 Verification & Testing

Every major domain feature is backed by isolated unit tests using pure functions:

```bash
# Run the complete test suite (128 tests)
npm test

# Run TypeScript strict type-check (0 errors)
npm run typecheck

# Run ESLint across app, components, lib, and tests (0 errors)
npm run lint

# Build production bundle (15/15 static pages)
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
- [x] **Phase 6**: PostgreSQL Persistence with Prisma Client & Server Actions
- [x] **Phase 7**: Authentication & Multi-Creator Studio Workspaces (Audited & Hardened)
- [x] **Phase 8**: Creator Workspace & Collaboration Layer (Switcher, RBAC, Invitations, Audit Logs, Profiles)
- [ ] **Phase 9**: Live YouTube Data API v3 & TikTok Creator API Integrations
- [ ] **Phase 10**: AI Assistant for Roblox Scriptwriting & Thumbnail Concepting

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

