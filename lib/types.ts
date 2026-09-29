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
  | "LONG VIDEO"
  | "OTHER";

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
  tags: string[];
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

export interface SceneItem {
  id: string;
  title: string;
  duration: number; // in seconds
  description: string;
  dialogue: string;
  characters: string[];
}

export interface ScriptItem {
  id: string;
  title: string;
  hook: string;
  estimatedDuration: number; // in seconds
  notes: string;
  scenes: SceneItem[];
  characters: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CharacterItem {
  id: string;
  name: string;
  avatarUrl: string;
  role: CharacterRole;
  description: string;
  personality: string;
  notes: string;
  tags: string[];
}

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
