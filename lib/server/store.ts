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
} from "../types";

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

// Development fallback store used when PostgreSQL is unreachable
class MemoryStore {
  ideas: IdeaItem[] = JSON.parse(JSON.stringify(INITIAL_IDEAS));
  characters: Character[] = JSON.parse(JSON.stringify(INITIAL_CHARACTERS));
  scripts: Script[] = JSON.parse(JSON.stringify(INITIAL_SCRIPTS));
  videos: Video[] = JSON.parse(JSON.stringify(INITIAL_VIDEOS));
  calendarEvents: CalendarEvent[] = JSON.parse(JSON.stringify(INITIAL_CALENDAR_EVENTS));
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
