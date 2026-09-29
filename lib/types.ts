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
  workspaceId?: string;
  userId?: string;
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
  workspaceId?: string;
  userId?: string;
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
  workspaceId?: string;
  userId?: string;
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
  workspaceId?: string;
  userId?: string;
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
  workspaceId?: string;
  userId?: string;
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

export type AnalyticsTimeRange = "7D" | "30D" | "90D" | "ALL";

export interface PlatformMetrics {
  platform: VideoPlatform;
  videos: number;
  views: number;
  averageViews: number;
  likes: number;
  comments: number;
  engagementRate: number;
}

export interface TimeSeriesDataPoint {
  date: string; // YYYY-MM-DD
  label: string; // "Sep 22"
  views: number;
  likes: number;
  comments: number;
  engagementRate: number;
  videoCount: number;
}

export interface CharacterAnalytics {
  characterId: string;
  name: string;
  role: string;
  avatar: string;
  appearances: number;
  totalViews: number;
  averageViews: number;
  totalLikes: number;
  totalComments: number;
  averageEngagementRate: number;
}

export interface CategoryPerformance {
  category: string;
  videoCount: number;
  totalViews: number;
  averageViews: number;
  averageEngagementRate: number;
}

export interface FormatPerformance {
  format: "Short" | "Long Video";
  videoCount: number;
  totalViews: number;
  averageViews: number;
  averageEngagementRate: number;
}

export interface CreatorInsight {
  id: string;
  type: "positive" | "info" | "neutral";
  title: string;
  detail: string;
  stat?: string;
}

export interface PublishingActivityData {
  period: string; // e.g. "Aug 2026", "Sep 2026"
  published: number;
  scheduled: number;
  inProduction: number;
}

// ==========================================
// Authentication & Multi-Tenant Workspace Types
// ==========================================

export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  creatorTag?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface SessionPayload {
  sub: string; // userId
  email: string;
  workspaceId: string;
  role: WorkspaceRole;
  name?: string;
  creatorTag?: string;
}

export interface AuthContext {
  user: AuthUser;
  workspace: Workspace;
  role: WorkspaceRole;
}

