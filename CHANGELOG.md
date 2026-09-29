# Changelog — ROXIE HUB

All notable changes to the ROXIE HUB platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - Phase 8: Creator Workspaces, Team Collaboration & Audit Logging

### Added
- **Creator Workspace Switcher & Context Re-signing**:
  - `components/layout/TopNav.tsx`: Dropdown workspace selector with active checkmark, role indicator, and instantaneous workspace switching.
  - `lib/server/workspaces.ts`: Multi-tenant workspace switching (`switchActiveWorkspace`). Strictly validates user membership in the requested workspace, issues a newly signed JWT session, and refreshes the HTTP-only `roxie_session` cookie.
  - Workspace details mutation (`updateWorkspaceDetails`) restricted to `OWNER` with unique slug generation and validation.
- **Role Hierarchy & Escalation Defense**:
  - `OWNER`, `ADMIN`, and `MEMBER` RBAC hierarchy enforcement.
  - Role escalation prevention: `ADMIN` members cannot promote themselves or anyone else to `OWNER`, nor invite with `OWNER` role.
  - Single-owner protection: Workspace `OWNER` cannot be demoted or removed unless workspace ownership is transferred.
  - Member departure (`leaveWorkspace`) safely allowing voluntary exit while blocking the sole owner from stranding a workspace.
- **Cryptographic Workspace Invitation System**:
  - Prisma model `WorkspaceInvitation` with indexed `tokenHash` (SHA-256) and `status` (`PENDING`, `ACCEPTED`, `EXPIRED`, `REVOKED`).
  - Cryptographically secure 64-character hex tokens generated via `crypto.randomBytes(32)`. Raw token is presented once to the inviter and never persisted in database or store.
  - 7-day automatic expiration enforcement with revocation controls.
  - Defensive validation blocking duplicate pending invitations and preventing inviting existing active workspace members.
- **Sanitized Workspace Audit Logging**:
  - Prisma model `AuditLog` capturing action name, entity type, entity ID, and actor ID.
  - `lib/server/audit.ts`: Automated audit recording for workspace updates, member invites, role transitions, removals, leaves, and registrations.
  - Strict metadata sanitizer `sanitizeAuditMetadata()` scrubbing passwords, tokens, hashes, cookies, secrets, and JWTs, and truncating strings > 256 characters.
- **User Profile Management**:
  - User model extended with `bio` (up to 500 characters) and `timezone` (defaulting to UTC).
  - `lib/server/profile.ts`: Validates name length (<= 60 chars), bio length (<= 500 chars), avatar URL protocols (`http:`, `https:`), and verifies/normalizes IANA timezones.
- **Workspace-Scoped Dashboard & Multi-Entity Search**:
  - `lib/server/dashboard.ts`: Workspace-scoped metric derivation with zero database fabrication. Returns clean empty states when a workspace has no records.
  - `lib/server/search.ts`: Server-side search executing across ideas, characters, scripts, and videos strictly within the active workspace.
- **UI Enhancements in Settings & Command Palette**:
  - `app/settings/page.tsx`: Full Workspace & Team tab with team member roster, role management, member removal, invitation generator with copy link button, pending invitations table, and live workspace audit log stream.
  - Profile tab hooked into persistent profile updates with immediate feedback.
  - `components/command/CommandPalette.tsx`: Added direct command palette shortcut to Workspace & Team settings.
- **Automated Verification Suite Expansion**:
  - `tests/workspaces.test.ts`: 17 comprehensive unit tests for workspace operations, role hierarchy, membership departure, switching, and profile validation.
  - `tests/invitations-audit.test.ts`: 17 comprehensive unit tests for token hashing, invitation lifecycle, duplicate prevention, metadata sanitization, empty workspace dashboard states, and search isolation.
  - Total test suite expanded from 94 to 128 tests passing (100% pass rate).

---

## [1.1.0] - Phase 7: Authentication & Multi-User Workspace Architecture

### Added
- **Multi-Tenant SaaS Workspace Architecture**:
  - Prisma models: `Workspace`, `WorkspaceMember`, and `WorkspaceRole` enum (`OWNER`, `ADMIN`, `MEMBER`).
  - Direct workspace scoping (`workspaceId`) on all core domain entities (`Idea`, `Character`, `Script`, `Video`, `CalendarEvent`).
  - Strict multi-tenant data isolation: all queries, mutations, search filters, notifications, and creator analytics calculations are strictly isolated to the active workspace.
- **Authentication Subsystem (`lib/auth/`)**:
  - `lib/auth/password.ts`: Password hashing and verification using `bcryptjs` (10 salt rounds).
  - `lib/auth/session.ts`: Signed JWT session tokens using `jose` (`HS256`, 7-day expiration) stored in secure HTTP-only cookies (`roxie_session`).
  - `lib/auth/context.ts`: Server-side context resolution for `{ user, workspace, role }` with database and development memory store fallbacks.
  - `lib/auth/permissions.ts`: Role-based access control (`assertPermission`, `hasMinimumRole`, `canManageWorkspace`, `canManageMembers`, `canCreateContent`, `canEditContent`, `canDeleteContent`).
- **Edge Route Protection Middleware (`middleware.ts`)**:
  - Edge-runtime compatible middleware verifying JWT session cookies for protected routes (`/dashboard`, `/ideas`, `/characters`, `/scripts`, `/videos`, `/calendar`, `/analytics`, `/settings`).
  - Automated redirection to `/login?callbackUrl=...` for unauthenticated requests.
  - Redirects authenticated users visiting `/login` or `/register` to `/dashboard`.
- **Authentication Server Actions (`app/actions/auth.ts`)**:
  - `registerAction`: Validates inputs, creates user and personal workspace, assigns `OWNER` membership, generates signed JWT, and sets cookie.
  - `loginAction`: Verifies credentials with `verifyPassword`, resolves workspace & role, generates signed JWT, and sets cookie.
  - `logoutAction`: Clears session cookie and invalidates state.
  - `getAuthSessionAction`: Returns authenticated session details for client components.
- **Authentication User Interfaces**:
  - `app/login/page.tsx` & `components/auth/LoginForm.tsx`: Styled sign-in form with client validation and 1-click Demo credentials auto-fill button (`roxie@bloxmedia.gg` / `RoxieHub2026!`).
  - `app/register/page.tsx` & `components/auth/RegisterForm.tsx`: Account and workspace registration form.
  - `app/forbidden/page.tsx`: 403 Access Restricted screen for unauthorized workspace resource requests.
  - `components/auth/AuthCard.tsx`: Reusable branding and form wrapper with ambient lighting effects.
- **Navigation & Settings Enhancements**:
  - `components/layout/TopNav.tsx`: Interactive User and Workspace dropdown displaying current creator avatar, name, email, workspace name, role badge, settings link, and Sign Out action.
  - `app/settings/page.tsx`: Added Active Workspace & SaaS Membership panel with workspace slug, workspace ID, role badge, and account email.
- **Seed & Data Access Updates**:
  - `prisma/seed.ts`: Seeds demo user `Roxie Velocity` with bcrypt hashed password, "Roxie Velocity Studio" workspace, and OWNER membership.
  - All server actions updated with server-side authorization: never trust client-provided `userId` or `workspaceId`.
- **Automated Test Suite Expansion**:
  - Added `tests/auth.test.ts` (7 tests) and `tests/authorization.test.ts` (3 tests).
  - Total test count expanded from 77 to 87 passing tests (0 failures).

---

## [1.0.0] - Phase 6: Full-Stack Persistence, Prisma ORM, PostgreSQL Schema & Server Actions

### Added
- **Production PostgreSQL Prisma Schema (`prisma/schema.prisma`)**:
  - Full relational architecture: `User`, `Idea`, `Character`, `Script`, `ScriptCharacter`, `Scene`, `DialogueLine`, `Video`, `VideoCharacter`, `CalendarEvent`, and `UserSettings`.
  - Cascading deletes (`onDelete: Cascade`) for Script -> Scenes -> DialogueLines to eliminate orphaned records.
  - Relational dependency protection (`onDelete: Restrict`) on Characters to prevent deleting avatars referenced in active screenplays.
  - Strategic indexing on `userId`, `status`, `category`, `platform`, `publishedAt`, and `scheduledAt`.
- **Server Data Access Layer (`lib/server/`)**:
  - Modular data access services: `ideas.ts`, `characters.ts`, `scripts.ts`, `videos.ts`, `calendar.ts`, `analytics.ts`, `settings.ts`.
  - Comprehensive input validation layer (`lib/server/validation.ts`) ensuring runtime integrity before database writes.
  - Resilient development fallback store (`lib/server/store.ts`) providing zero-downtime offline execution.
  - User context abstraction (`lib/server/user-context.ts`) scoping all operations by `userId` (prepares for Phase 7 authentication).
- **Next.js Server Actions Layer (`app/actions/`)**:
  - `"use server"` CRUD action endpoints for Ideas, Characters, Scripts, Scenes, Dialogue, Videos, Calendar Events, and Settings.
  - Automated cache revalidation (`revalidatePath()`) refreshing `/ideas`, `/characters`, `/scripts`, `/videos`, `/calendar`, `/analytics`, `/dashboard`, and `/settings`.
- **Automated Database Seeder (`prisma/seed.ts`)**:
  - Seeds a complete production workspace with demo creator `Roxie Velocity`, 18 ideas, 10 characters, 5 scripts, multiple scenes & dialogue lines, 14 multi-platform videos, and 10 calendar drops.
  - Configured with `npx prisma db seed`.
- **Database & Persistence Test Suite (`tests/database.test.ts`)**:
  - 11 unit tests covering server-side validation, full CRUD lifecycles, screenplay hierarchy cascades, character dependency protection, calendar updates, and persisted analytics consumption (total 77 tests passing).

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
