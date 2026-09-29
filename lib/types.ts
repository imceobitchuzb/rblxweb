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
  | "YOUTUBE"
  | "YOUTUBE_SHORTS"
  | "TIKTOK"
  | "ROBLOX";

export type VideoStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

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

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  platform: VideoPlatform;
  status: VideoStatus;
  views: number;
  likes: number;
  comments: number;
  durationSeconds: number;
  publicationDate?: string;
  tags: string[];
}

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

export interface CalendarEventItem {
  id: string;
  title: string;
  scheduledDate: string;
  platform: VideoPlatform;
  status: VideoStatus;
  videoId?: string;
  notes?: string;
}

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
