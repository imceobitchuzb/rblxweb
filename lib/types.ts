export type IdeaStatus =
  | "IDEA"
  | "PLANNING"
  | "SCRIPTING"
  | "PRODUCTION"
  | "PUBLISHED"
  | "ARCHIVED";

export type IdeaCategory =
  | "MM2"
  | "FUNNY"
  | "STORY"
  | "TREND"
  | "SHORT"
  | "LONG_VIDEO"
  | "OTHER";

export type IdeaPriority = "LOW" | "MEDIUM" | "HIGH" | "HOT";

export type VideoPlatform =
  | "YOUTUBE_SHORTS"
  | "YOUTUBE"
  | "TIKTOK"
  | "INSTAGRAM_REELS";

export type VideoStatus =
  | "PLANNING"
  | "IN_PRODUCTION"
  | "EDITING"
  | "READY"
  | "SCHEDULED"
  | "PUBLISHED"
  | "ARCHIVED";

export type CharacterRole =
  | "MAIN"
  | "SUPPORTING"
  | "VILLAIN"
  | "NPC"
  | "SPECIAL_GUEST";

export interface IdeaItem {
  id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  status: IdeaStatus;
  priority: IdeaPriority;
  tags: string[];
  potentialScore: number; // 1 to 10
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  status: VideoStatus;
  platform: VideoPlatform;
  thumbnail: string;
  duration: number; // in seconds
  durationSeconds?: number; // backwards compatibility alias
  scriptId?: string;
  ideaId?: string;
  characterIds: string[];
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  publishedAt?: string;
  publicationDate?: string; // backwards compatibility alias
  scheduledAt?: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

// Backward compatibility alias
export type VideoItem = Video;

export type DialogueEmotion =
  | "NEUTRAL"
  | "HAPPY"
  | "ANGRY"
  | "SCARED"
  | "CONFUSED"
  | "SUSPICIOUS"
  | "EXCITED"
  | "SURPRISED";

export type ScriptStatus =
  | "DRAFT"
  | "SCRIPTING"
  | "READY"
  | "IN_PRODUCTION"
  | "COMPLETED"
  | "ARCHIVED";

export interface DialogueLine {
  id: string;
  characterId: string;
  text: string;
  emotion: DialogueEmotion;
  duration: number; // in seconds
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  dialogue: DialogueLine[];
  characters: string[]; // character IDs
  notes: string;
}

// Backward compatibility alias
export type SceneItem = Scene;

export interface Script {
  id: string;
  ideaId?: string;
  title: string;
  description: string;
  status: ScriptStatus;
  hook: string;
  scenes: Scene[];
  characters: string[]; // character IDs
  tags: string[];
  estimatedDuration: number; // in seconds
  createdAt: string;
  updatedAt: string;
}

// Backward compatibility alias
export type ScriptItem = Script;

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  description: string;
  personality: string;
  tags: string[];
  avatar: string;
  avatarUrl?: string; // alias
  outfit: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Backward compatibility alias
export type CharacterItem = Character;

export type CalendarEventType =
  | "VIDEO"
  | "UPLOAD"
  | "PREMIERE"
  | "IDEA"
  | "DEADLINE";

export type CalendarEventStatus =
  | "PLANNED"
  | "READY"
  | "PUBLISHED"
  | "CANCELLED";

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  videoId?: string;
  platform: VideoPlatform;
  status: CalendarEventStatus;
  scheduledAt: string;
  scheduledDate?: string; // backwards compatibility alias
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Backward compatibility alias
export type CalendarEventItem = CalendarEvent;

export interface AnalyticsSummary {
  totalViews: number;
  averageViews: number;
  totalLikes: number;
  totalComments: number;
  engagementRate: number;
  streakDays: number;
  totalVideos: number;
  totalIdeas: number;
}

export interface CreatorProfile {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  robloxUsername: string;
  streakDays: number;
  primaryPlatform: VideoPlatform;
}
