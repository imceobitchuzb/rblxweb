# ROXIE HUB 🎮

> **The Modern Content-Management & Analytics Operating System for Roblox Creators**

ROXIE HUB is a web application built specifically for Roblox video creators and studio directors. It streamlines every phase of Roblox content production: brainstorming ideas, organizing character rosters, scripting dialogue and scenes, managing multi-platform publication schedules (YouTube, YouTube Shorts, TikTok), and tracking growth analytics.

---

## 🚀 Features & Modules

- **Dashboard**: Unified overview of upload streaks, quick stats, content pipeline status, and immediate actions.
- **Ideas Studio**: Comprehensive idea incubator for Roblox creators featuring multi-filter search, priority ratings, potential viral score gauges, Grid & Kanban views, idea creation/editing dialogs, and linear status pipeline transitions.
  - **Categories**: `MM2`, `Funny`, `Story`, `Trend`, `Short`, `Long Video`, `Other`
  - **Statuses**: `IDEA` → `PLANNING` → `SCRIPTING` → `PRODUCTION` → `PUBLISHED` → `ARCHIVED`
  - **Priorities**: `LOW`, `MEDIUM`, `HIGH`, `HOT 🔥`
- **Character Roster**: Complete Roblox avatar and persona library. Store characters with distinct archetypes, detailed outfits, voice/sound acting notes, and personality descriptions. Features cross-module script tracking to see all screenplays where a character appears.
  - **Roles**: `MAIN`, `SUPPORTING`, `VILLAIN`, `NPC`, `SPECIAL GUEST`
- **Script Studio**: Interactive 3-pane Roblox screenplay studio.
  - **3-Pane Studio Layout**: Scene navigation (left), dialogue and speech line editor (center), and live cast inspector with runtime calculation (right).
  - **Prominent Hook Editor**: Dedicated banner for the video opening hook (3s retention anchor) with character counters.
  - **Scene System**: Multi-scene breakdown with duration overrides, stage directions, and reordering controls.
  - **Dialogue System**: Assign character avatars by ID, select emotions (`NEUTRAL`, `HAPPY`, `ANGRY`, `SCARED`, `CONFUSED`, `SUSPICIOUS`, `EXCITED`, `SURPRISED`), and configure speech durations.
  - **Live Runtime Calculation**: Real-time duration summation (`mm:ss.s`) and metric counters (Scenes, Lines, Cast).
  - **Script Pipeline**: `DRAFT` → `SCRIPTING` → `READY` → `IN_PRODUCTION` → `COMPLETED` → `ARCHIVED`.
  - **Cross-Module Linkage**: Convert brainstormed concepts from Ideas Studio into structured screenplays via `ideaId`.
- **Videos Module**: Multi-platform video asset tracking (YouTube, Shorts, TikTok, Roblox Experiences) with view, like, comment, and duration metrics.
- **Content Calendar**: Release schedule timetable and drag-and-drop planning to safeguard the creator streak.
- **Content Analytics**: Engagement metrics, average view counts, interaction rates, and time-series performance charts.
- **Settings**: Creator profile, dark gaming theme customization, notification channels, and external API connection keys.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Server & Client Components) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict typing mode) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (Custom gaming dark theme & glassmorphic tokens) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database ORM** | [Prisma](https://www.prisma.io/) (PostgreSQL target architecture) |
| **Testing** | Node.js Test Runner + [tsx](https://github.com/privatenumber/tsx) |
| **Tooling** | ESLint, PostCSS, Autoprefixer |

---

## 📂 Project Structure

```text
rblxweb/
├── app/                      # Next.js App Router root
│   ├── globals.css           # Custom dark gaming styles, glass panels, neon glows
│   ├── layout.tsx            # Root layout with font injection & AppShell wrapper
│   ├── page.tsx              # Root route redirecting to /dashboard
│   ├── dashboard/            # Overview dashboard
│   ├── ideas/                # Ideas incubator & classification
│   ├── videos/               # Video metadata & multi-platform hub
│   ├── scripts/              # Structured scene-by-scene script studio
│   ├── characters/           # Roblox avatar and character roster
│   ├── calendar/             # Content timetable & release scheduler
│   ├── analytics/            # Performance analytics & metrics
│   └── settings/             # Creator settings & integrations
├── components/
│   ├── layout/               # Application shell, Sidebar, TopNav, MobileNav
│   └── ui/                   # Modular UI primitives (Button, Card, Badge, Input, EmptyState)
├── lib/
│   ├── constants.ts          # Navigation links, colors, platform maps, default creator
│   ├── types.ts              # Strict TypeScript domain interfaces
│   └── utils.ts              # Class merging (cn), metric & duration formatters
├── prisma/
│   └── schema.prisma         # PostgreSQL schema for Ideas, Videos, Scripts, Characters
├── tests/
│   └── architecture.test.ts  # Route, metric, and schema tests
├── .env.example              # Documented environment variables template
├── package.json              # Project manifests and scripts
├── tailwind.config.ts        # Custom dark gaming color palette and design system
└── tsconfig.json             # TypeScript compiler settings
```

---

## 💻 Development Instructions

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate # or npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Lint, Typecheck & Tests

```bash
# Run unit tests
npm test

# Run TypeScript type check
npm run typecheck

# Run ESLint
npm run lint

# Production build test
npm run build
```

---

## 🗺️ Engineering Roadmap

- [x] **Phase 1: Foundation & Application Shell**
  - Next.js + TypeScript + Tailwind CSS dark gaming identity
  - Responsive AppShell with persistent desktop Sidebar, mobile drawer, and TopNav
  - Placeholder route scaffolding for all 8 modules
  - Core UI primitives (`Button`, `Card`, `Badge`, `Input`, `EmptyState`)
  - Prisma schema architecture & unit tests
- [x] **Phase 2: Ideas Studio & Local Data Layer**
  - 18 realistic Roblox content ideas (Murder Mystery 2, skits, challenges, trends)
  - Interactive Ideas Studio with real-time multi-filter search (title, description, tags)
  - Category filters (`MM2`, `Funny`, `Story`, `Trend`, `Short`, `Long Video`, `Other`)
  - Status filters (`IDEA`, `PLANNING`, `SCRIPTING`, `PRODUCTION`, `PUBLISHED`, `ARCHIVED`)
  - Priority levels with neon glowing emphasis for `HOT 🔥`
  - Dynamic summary metrics (Total, Hot, Planning, Production, Published)
  - Grid View and Kanban Board with quick status progression
  - Modals for Idea creation, editing, deletion confirmation, and detailed inspection
  - 16 comprehensive unit tests covering filtering, validation, and CRUD operations
- [x] **Phase 3: Character Roster & Script Studio**
  - Roblox Character Roster with avatar profiles, roles, personality notes, and search/filter controls
  - 10 realistic Roblox characters (Sheriff Knox, Slick Blade, Bacon Benny, Kage, Blox, etc.)
  - Script Studio with library view and responsive 3-pane screenplay editor
  - 5 realistic Roblox animation scripts with dialogue, emotions, and durations
  - Dedicated video opening hook editor with real-time character counters
  - Scene management (add, edit, delete, reorder up/down, duration overrides)
  - Dialogue line editor with character assignment by ID and 8 emotion cues
  - Live automatic runtime calculation (`mm:ss.s`)
  - Cross-module relationship linking (Character -> Scripts, Script -> Characters, Idea -> Script)
  - 29 total unit tests verifying architecture, ideas, characters, scripts, and relationships
- [x] **Phase 4: Video Studio & Content Calendar**
  - **Video Studio (`/videos`)**: Complete video asset management platform with 10 realistic Roblox creator video assets across 4 platforms (`YouTube Shorts`, `YouTube`, `TikTok`, `Instagram Reels`)
  - **Video Status Workflow**: Track videos across `PLANNING` → `IN_PRODUCTION` → `EDITING` → `READY` → `SCHEDULED` → `PUBLISHED` → `ARCHIVED`
  - **Multi-Field Filtering & Sorting**: Instant search across titles, descriptions, and tags; filter by platform and workflow status; sort by publication date, views, duration, or title
  - **Video Details Dossier**: Interactive modal with simulated media player HUD, performance metrics (Views, Likes, Comments, Engagement Rate %), assigned character cast, linked screenplay source, and origin idea
  - **Script → Video Conversion**: One-click action in Script Studio to generate prefilled video assets directly from screenplays
  - **Content Calendar (`/calendar`)**: Responsive Month and Week timeline views with intuitive period navigation (`<`, `Today`, `>`), search and platform/type/status filtering
  - **Event Scheduling System**: Schedule publication drops (`VIDEO`, `UPLOAD`, `PREMIERE`, `IDEA`, `DEADLINE`) with automatic video status synchronization
  - **Upcoming Drops Panel**: Chronological upcoming release watchlist with date and time breakdowns
  - **Dashboard Command Center (`/dashboard`)**: Interactive creator pipeline stage overview (`IDEAS → SCRIPTS → VIDEOS → SCHEDULED → PUBLISHED`), upcoming drops schedule, top published release showcases, and consistency streak tracker
  - **42 Unit Tests Passing**: Full verification of video integrity, calendar math, filtering, scheduling, and cross-module ID preservation
- [ ] **Phase 5: Analytics Dashboard & Creator Profile**
  - Key performance indicators, interactive charts, engagement breakdowns
- [ ] **Phase 6: Persistence & External Integrations**
  - PostgreSQL live connection via Prisma (seamlessly swapping local mock state with server actions / API routes without UI rewrites)
  - YouTube Data API v3 and TikTok Creator API sync
  - AI script and hook assistant
