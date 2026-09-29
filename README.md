# ROXIE HUB 🎮

> **The Modern Content-Management & Analytics Operating System for Roblox Creators**

ROXIE HUB is a web application built specifically for Roblox video creators and studio directors. It streamlines every phase of Roblox content production: brainstorming ideas, organizing character rosters, scripting dialogue and scenes, managing multi-platform publication schedules (YouTube, YouTube Shorts, TikTok), and tracking growth analytics.

---

## 🚀 Features & Modules

- **Dashboard**: Unified overview of upload streaks, quick stats, content pipeline status, and immediate actions.
- **Ideas Hub**: Idea incubator with categorized tags (`MM2`, `Funny`, `Story`, `Trend`, `Short`, `Long Video`) and Kanban status workflow (`IDEA` → `PLANNING` → `SCRIPTING` → `PRODUCTION` → `PUBLISHED`).
- **Videos Module**: Multi-platform video asset tracking (YouTube, Shorts, TikTok, Roblox Experiences) with view, like, comment, and duration metrics.
- **Script Studio**: Structured scene-by-scene script editor with hook engineering, dialogue lines, character assignments, and runtime estimation.
- **Character Roster**: Roblox avatar library storing characters, roles (`MAIN`, `SUPPORTING`, `VILLAIN`, `NPC`, `SPECIAL GUEST`), personalities, and tags.
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
- [ ] **Phase 2: Ideas Module & Local State**
  - Interactive idea creation modal, category filter tabs, Kanban / list status toggling
- [ ] **Phase 3: Character Roster & Script Studio**
  - Character creation cards, scene builder, dialogue block editor, runtime calculation
- [ ] **Phase 4: Content Calendar & Video Management**
  - Video asset cards, release scheduling calendar view, platform status badges
- [ ] **Phase 5: Analytics Dashboard & Creator Profile**
  - Key performance indicators, interactive charts, engagement breakdowns
- [ ] **Phase 6: Persistence & External Integrations**
  - PostgreSQL live connection via Prisma, YouTube Data API v3, TikTok Creator API, AI assistant
