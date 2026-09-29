import bcrypt from "bcryptjs";
import { INITIAL_IDEAS } from "../mock-ideas";
import { INITIAL_CHARACTERS } from "../mock-characters";
import { INITIAL_SCRIPTS } from "../mock-scripts";
import { INITIAL_VIDEOS } from "../mock-videos";
import { INITIAL_CALENDAR_EVENTS } from "../mock-calendar";
import {
  CalendarEvent,
  Character,
  IdeaItem,
  Script,
  Video,
  Workspace,
  WorkspaceMember,
} from "../types";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  creatorTag: string;
  avatarUrl: string;
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
export const DEMO_DEFAULT_PASSWORD = "RoxieHub2026!";

// Pre-computed hash of "RoxieHub2026!"
const DEMO_PASSWORD_HASH = bcrypt.hashSync(DEMO_DEFAULT_PASSWORD, 10);

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
