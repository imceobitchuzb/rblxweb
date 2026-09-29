import bcrypt from "bcryptjs";
import { INITIAL_IDEAS } from "../mock-ideas";
import { INITIAL_CHARACTERS } from "../mock-characters";
import { INITIAL_SCRIPTS } from "../mock-scripts";
import { INITIAL_VIDEOS } from "../mock-videos";
import { INITIAL_CALENDAR_EVENTS } from "../mock-calendar";
import {
  AuditLog,
  CalendarEvent,
  Character,
  IdeaItem,
  Script,
  Video,
  Workspace,
  WorkspaceInvitation,
  WorkspaceMember,
} from "../types";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  creatorTag: string;
  avatarUrl: string;
  bio?: string;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettingsRecord {
  id: string;
  userId: string;
  theme: string;
  emailNotifications: boolean;
  browserNotifications: boolean;
  defaultPlatform: string;
  connectedYoutube: boolean;
  connectedTiktok: boolean;
}

export const DEMO_USER_ID = "user-creator-roxie";
export const DEMO_WORKSPACE_ID = "workspace-demo-roxie";
export const DEMO_DEFAULT_PASSWORD =
  process.env.DEMO_USER_PASSWORD ||
  (process.env.NODE_ENV !== "production" ? "RoxieHub2026!" : "");

// Pre-computed hash of demo password, disabled with dummy hash if demo password is unset
const DEMO_PASSWORD_HASH = DEMO_DEFAULT_PASSWORD
  ? bcrypt.hashSync(DEMO_DEFAULT_PASSWORD, 10)
  : "$2a$10$e7xEXAMPLEdummyhashthatnevermatchesanything1234567890";

/**
 * Asserts that the persistent database layer is active in production.
 * In production mode (NODE_ENV === "production"), ROXIE HUB strictly prohibits
 * falling back to ephemeral in-memory stores to prevent silent data loss and
 * unpersisted tenant isolation breaches.
 */
export function assertPersistentDatabase(operation: string, error?: unknown): void {
  if (process.env.NODE_ENV === "production") {
    const errorMsg = error instanceof Error ? error.message : String(error ?? "Database connection unavailable");
    console.error(
      `[Production Persistence Failure] Operation '${operation}' aborted because persistent database is required in production: ${errorMsg}`
    );
    throw new Error(
      `[Production Persistence Failure] Database is required in production mode. Fallback in-memory operations are disabled for security and data integrity during '${operation}'. Root cause: ${errorMsg}`
    );
  }
}

function tagWithDemoWorkspace<T extends { workspaceId?: string; userId?: string }>(items: T[]): T[] {
  return items.map((item) => ({
    ...item,
    workspaceId: item.workspaceId || DEMO_WORKSPACE_ID,
    userId: item.userId || DEMO_USER_ID,
  }));
}

// Development fallback store used when PostgreSQL is unreachable
class MemoryStore {
  users: UserRecord[] = [
    {
      id: DEMO_USER_ID,
      email: "roxie@bloxmedia.gg",
      passwordHash: DEMO_PASSWORD_HASH,
      name: "Roxie Velocity",
      creatorTag: "ROXIE_PRO",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "Roblox content creator & animation director focusing on MM2 & BedWars.",
      timezone: "America/New_York",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  workspaces: Workspace[] = [
    {
      id: DEMO_WORKSPACE_ID,
      name: "Roxie Velocity Studio",
      slug: "roxie-velocity",
      ownerId: DEMO_USER_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  workspaceMembers: WorkspaceMember[] = [
    {
      id: "member-demo-roxie",
      workspaceId: DEMO_WORKSPACE_ID,
      userId: DEMO_USER_ID,
      role: "OWNER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  invitations: WorkspaceInvitation[] = [];
  auditLogs: AuditLog[] = [
    {
      id: "audit-demo-1",
      workspaceId: DEMO_WORKSPACE_ID,
      actorId: DEMO_USER_ID,
      action: "WORKSPACE_RENAMED",
      entityType: "WORKSPACE",
      entityId: DEMO_WORKSPACE_ID,
      metadata: { name: "Roxie Velocity Studio" },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  ideas: IdeaItem[] = tagWithDemoWorkspace(JSON.parse(JSON.stringify(INITIAL_IDEAS)));
  characters: Character[] = tagWithDemoWorkspace(JSON.parse(JSON.stringify(INITIAL_CHARACTERS)));
  scripts: Script[] = tagWithDemoWorkspace(JSON.parse(JSON.stringify(INITIAL_SCRIPTS)));
  videos: Video[] = tagWithDemoWorkspace(JSON.parse(JSON.stringify(INITIAL_VIDEOS)));
  calendarEvents: CalendarEvent[] = tagWithDemoWorkspace(JSON.parse(JSON.stringify(INITIAL_CALENDAR_EVENTS)));

  settings: Record<string, UserSettingsRecord> = {
    "user-creator-roxie": {
      id: "settings-roxie",
      userId: "user-creator-roxie",
      theme: "dark",
      emailNotifications: true,
      browserNotifications: true,
      defaultPlatform: "YOUTUBE",
      connectedYoutube: false,
      connectedTiktok: false,
    },
  };
}

const globalForStore = globalThis as unknown as {
  roxieMemoryStore: MemoryStore | undefined;
};

export const memoryStore = globalForStore.roxieMemoryStore ?? new MemoryStore();

if (process.env.NODE_ENV !== "production") {
  globalForStore.roxieMemoryStore = memoryStore;
}
