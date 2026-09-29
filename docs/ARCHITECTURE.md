# ROXIE HUB — Architecture & Engineering Specification

## 1. System Overview

ROXIE HUB is an enterprise-grade creator intelligence and production workflow platform tailored specifically for Roblox gaming content creators. It bridges the gap between chaotic video concept ideation and multi-channel publication metrics.

```
+-----------------------------------------------------------------------------------------------+
|                                        BROWSER / CLIENT                                       |
|                                                                                               |
|  +--------------------+  +-----------------------------------------------------------------+  |
|  |      SIDEBAR       |  |                             TOPNAV                              |  |
|  |                    |  |  [Global Search Ctrl+K]  [Notifications Bell]  [Profile Chip]   |  |
|  |  * Studio / Ideas  |  +-----------------------------------------------------------------+  |
|  |  * Characters      |                                                                       |
|  |  * Scripts         |  +-----------------------------------------------------------------+  |
|  |  * Videos          |  |                       NEXT.JS UI VIEW                           |  |
|  |  * Calendar        |  |                                                                 |  |
|  |  * Analytics       |  |   /dashboard   /ideas   /characters   /scripts                  |  |
|  |  * Settings        |  |   /videos      /calendar              /analytics  /settings     |  |
|  +--------------------+  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------------+
                                           |
                                           | (Next.js Server Actions)
                                           v
+-----------------------------------------------------------------------------------------------+
|                                    SERVER ACTION LAYER ("use server")                          |
|                                                                                               |
|   +-----------------------+  +-----------------------+  +---------------------------------+   |
|   | app/actions/ideas.ts  |  | app/actions/scripts.ts|  | app/actions/videos.ts           |   |
|   +-----------------------+  +-----------------------+  +---------------------------------+   |
|   +-----------------------+  +-----------------------+  +---------------------------------+   |
|   | app/actions/chars.ts  |  | app/actions/cal.ts    |  | app/actions/settings.ts         |   |
|   +-----------------------+  +-----------------------+  +---------------------------------+   |
+-----------------------------------------------------------------------------------------------+
                                           |
                                           | (Scoped Queries & Input Validation)
                                           v
+-----------------------------------------------------------------------------------------------+
|                                  SERVER DATA ACCESS LAYER (lib/server)                        |
|                                                                                               |
|   +-------------------+  +-------------------+  +-------------------+  +------------------+   |
|   | lib/server/ideas  |  | lib/server/scripts|  | lib/server/videos |  | lib/server/cal   |   |
|   +-------------------+  +-------------------+  +-------------------+  +------------------+   |
|   +-------------------+  +-------------------+  +-------------------+  +------------------+   |
|   | lib/server/chars  |  | lib/server/valid  |  | lib/server/user-ctx| | lib/server/analyt|   |
|   +-------------------+  +-------------------+  +-------------------+  +------------------+   |
+-----------------------------------------------------------------------------------------------+
                                           |
                                           | (PrismaClient Singleton)
                                           v
+-----------------------------------------------------------------------------------------------+
|                                      PRISMA ORM (lib/prisma.ts)                               |
|                                                                                               |
|   * Relations: Cascades on Scene/Dialogue, Restrict on Character script reference             |
|   * Indexes: userId, status, category, platform, scheduledAt, publishedAt                     |
|   * Schema: prisma/schema.prisma                                                              |
+-----------------------------------------------------------------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------------------+
|                                     POSTGRESQL DATABASE                                       |
|                                                                                               |
|   * Relational Tables: User, Idea, Character, Script, Scene, DialogueLine, Video,             |
|                        CalendarEvent, UserSettings, ScriptCharacter, VideoCharacter           |
|   * Connection: DATABASE_URL (postgresql://...)                                               |
+-----------------------------------------------------------------------------------------------+

Analytics Data Flow:
+-------------------+      +------------------+      +--------------------+      +--------------+
|    PostgreSQL     | ───> |  lib/server/     | ───> | lib/analytics-     | ───> | /analytics   |
| Database Records  |      |  analytics.ts    |      | utils.ts (Pure)    |      | UI Dashboard |
+-------------------+      +------------------+      +--------------------+      +--------------+
```

---

## 2. Creator Workflow Lifecycle & Data Integrity

ROXIE HUB executes an end-to-end continuous loop for Roblox creators:

1. **IDEA (`/ideas`)**
   - Concept capture with viral potential rating (1-10), target category, tags, and priority.
   - Status evolves: `IDEA` -> `PLANNING` -> `SCRIPTING` -> `PRODUCTION` -> `PUBLISHED`.
   - "Convert to Script" factory function seeds screenplay with full metadata inheritance.

2. **CHARACTERS (`/characters`)**
   - Central character roster tracking avatars, personalities, outfits, and dialogue tropes.
   - **Dependency Protection**: Deleting a character that is referenced by active screenplays is blocked with a human-readable error (`onDelete: Restrict`).

3. **SCRIPTS (`/scripts`)**
   - Screenplay Studio supporting multi-scene breakdowns, character assignment, dialogue duration estimation, and stage directions.
   - Computes total runtime automatically via pure function `calculateScriptRuntime()`.
   - **Cascades**: Deleting a Script cascades to its Scenes, which cascade to their DialogueLines (`onDelete: Cascade`).

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

## 3. Data Models & Relational Architecture

| Model | Primary Key | Foreign Keys / Relations | Cascade / Deletion Behavior |
|---|---|---|---|
| `User` | `id` (cuid) | 1:N with Idea, Character, Script, Video, CalendarEvent, UserSettings | `onDelete: Cascade` |
| `Idea` | `id` (cuid) | `userId` -> `User.id` | Cascades from User |
| `Character` | `id` (cuid) | `userId` -> `User.id` | Cascades from User; protected by `Restrict` from scripts |
| `Script` | `id` (cuid) | `userId` -> `User.id`, `ideaId` -> `Idea.id` (SetNull) | Cascades scenes on deletion |
| `ScriptCharacter` | `(scriptId, characterId)` | `scriptId` -> `Script.id` (Cascade), `characterId` -> `Character.id` (Restrict) | Prevents deleting cast characters |
| `Scene` | `id` (cuid) | `scriptId` -> `Script.id` (Cascade) | Cascades dialogue lines |
| `DialogueLine` | `id` (cuid) | `sceneId` -> `Scene.id` (Cascade), `characterId` -> `Character.id` (Restrict) | Cleaned up with scene |
| `Video` | `id` (cuid) | `userId` -> `User.id`, `ideaId` -> `Idea.id` (SetNull), `scriptId` -> `Script.id` (SetNull) | Relational references nulled on parent delete |
| `VideoCharacter` | `(videoId, characterId)` | `videoId` -> `Video.id` (Cascade), `characterId` -> `Character.id` (Restrict) | Links video cast |
| `CalendarEvent` | `id` (cuid) | `userId` -> `User.id`, `videoId` -> `Video.id` (SetNull) | Preserves calendar slot if video removed |
| `UserSettings` | `id` (cuid) | `userId` -> `User.id` (Unique, Cascade) | 1:1 with User |

---

## 4. Server Actions Layer (`app/actions/`)

All database mutations and queries are exposed to client components strictly through Next.js Server Actions (`"use server"`):

| Domain | Action File | Actions Implemented |
|---|---|---|
| **Ideas** | `app/actions/ideas.ts` | `fetchIdeasAction`, `createIdeaAction`, `updateIdeaAction`, `deleteIdeaAction`, `advanceIdeaStatusAction` |
| **Characters** | `app/actions/characters.ts` | `fetchCharactersAction`, `createCharacterAction`, `updateCharacterAction`, `deleteCharacterAction` |
| **Scripts** | `app/actions/scripts.ts` | `fetchScriptsAction`, `createScriptAction`, `updateScriptAction`, `deleteScriptAction`, `createSceneAction`, `updateSceneAction`, `deleteSceneAction`, `reorderScenesAction`, `createDialogueLineAction`, `updateDialogueLineAction`, `deleteDialogueLineAction` |
| **Videos** | `app/actions/videos.ts` | `fetchVideosAction`, `createVideoAction`, `updateVideoAction`, `deleteVideoAction` |
| **Calendar** | `app/actions/calendar.ts` | `fetchCalendarEventsAction`, `createCalendarEventAction`, `updateCalendarEventAction`, `deleteCalendarEventAction` |
| **Settings** | `app/actions/settings.ts` | `fetchUserSettingsAction`, `updateUserSettingsAction` |

---

## 5. Pure Business Logic & Testability

All state calculation, transformation, filtering, and formatting is isolated in pure TypeScript functions under `lib/`:

| Module | Source File | Test File | Test Count |
|---|---|---|---|
| Architecture & Constants | `lib/constants.ts`, `lib/types.ts` | `tests/architecture.test.ts` | 4 tests |
| Ideas Studio Engine | `lib/mock-ideas.ts` | `tests/ideas.test.ts` | 12 tests |
| Character Roster Engine | `lib/mock-characters.ts` | `tests/characters.test.ts` | 6 tests |
| Script Studio Engine | `lib/mock-scripts.ts` | `tests/scripts.test.ts` | 7 tests |
| Video Studio Engine | `lib/video-utils.ts` | `tests/videos.test.ts` | 7 tests |
| Calendar Engine | `lib/calendar-utils.ts` | `tests/calendar.test.ts` | 6 tests |
| Analytics & Insights Engine | `lib/analytics-utils.ts` | `tests/analytics.test.ts` | 16 tests |
| Shell, Search & Notifications | `lib/search-utils.ts`, `lib/notification-utils.ts` | `tests/shell-navigation.test.ts` | 8 tests |
| Database & Persistence | `lib/server/...`, `lib/prisma.ts` | `tests/database.test.ts` | 11 tests |
| **Total** | | | **77 tests** |

---

## 6. Seed & Development Workflow

To initialize or reset the database:

```bash
# 1. Validate Prisma schema
npx prisma validate

# 2. Generate Prisma Client
npx prisma generate

# 3. Create or run database migrations (requires PostgreSQL)
npx prisma migrate dev --name init_roxie_hub_persistence

# 4. Seed database with full creator workspace
npx prisma db seed

# 5. Visual data inspection
npx prisma studio
```
