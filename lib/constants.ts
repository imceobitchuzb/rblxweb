import {
  LayoutDashboard,
  Lightbulb,
  Video,
  FileText,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
} from "lucide-react";
import type {
  CharacterRole,
  DialogueEmotion,
  IdeaCategory,
  IdeaPriority,
  IdeaStatus,
  ScriptStatus,
  VideoPlatform,
} from "./types";

export const ALL_ROLES: CharacterRole[] = [
  "MAIN",
  "SUPPORTING",
  "VILLAIN",
  "NPC",
  "SPECIAL_GUEST",
];

export const ROLE_LABELS: Record<CharacterRole, string> = {
  MAIN: "Main",
  SUPPORTING: "Supporting",
  VILLAIN: "Villain",
  NPC: "NPC",
  SPECIAL_GUEST: "Special Guest",
};

export const ROLE_CONFIG: Record<
  CharacterRole,
  { label: string; bg: string; text: string; border: string; badgeVariant: "purple" | "neon" | "crimson" | "default" | "amber" }
> = {
  MAIN: {
    label: "Main",
    bg: "bg-violet-500/10",
    text: "text-violet-300",
    border: "border-violet-500/30",
    badgeVariant: "purple",
  },
  SUPPORTING: {
    label: "Supporting",
    bg: "bg-cyan-500/10",
    text: "text-cyan-300",
    border: "border-cyan-500/30",
    badgeVariant: "neon",
  },
  VILLAIN: {
    label: "Villain",
    bg: "bg-rose-500/10",
    text: "text-rose-300",
    border: "border-rose-500/30",
    badgeVariant: "crimson",
  },
  NPC: {
    label: "NPC",
    bg: "bg-slate-500/10",
    text: "text-slate-300",
    border: "border-slate-500/30",
    badgeVariant: "default",
  },
  SPECIAL_GUEST: {
    label: "Special Guest",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    border: "border-amber-500/30",
    badgeVariant: "amber",
  },
};

export const ALL_SCRIPT_STATUSES: ScriptStatus[] = [
  "DRAFT",
  "SCRIPTING",
  "READY",
  "IN_PRODUCTION",
  "COMPLETED",
  "ARCHIVED",
];

export const SCRIPT_STATUS_LABELS: Record<ScriptStatus, string> = {
  DRAFT: "Draft",
  SCRIPTING: "Scripting",
  READY: "Ready",
  IN_PRODUCTION: "In Production",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

export const SCRIPT_STATUS_PROGRESSION: ScriptStatus[] = [
  "DRAFT",
  "SCRIPTING",
  "READY",
  "IN_PRODUCTION",
  "COMPLETED",
  "ARCHIVED",
];

export const SCRIPT_STATUS_CONFIG: Record<
  ScriptStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  DRAFT: { bg: "bg-slate-800/60", text: "text-slate-300", dot: "bg-slate-400" },
  SCRIPTING: { bg: "bg-purple-900/40", text: "text-purple-300", dot: "bg-purple-400" },
  READY: { bg: "bg-blue-900/40", text: "text-blue-300", dot: "bg-blue-400" },
  IN_PRODUCTION: { bg: "bg-amber-900/40", text: "text-amber-300", dot: "bg-amber-400" },
  COMPLETED: { bg: "bg-emerald-900/40", text: "text-emerald-300", dot: "bg-emerald-400" },
  ARCHIVED: { bg: "bg-zinc-800/40", text: "text-zinc-400", dot: "bg-zinc-500" },
};

export const ALL_EMOTIONS: DialogueEmotion[] = [
  "NEUTRAL",
  "HAPPY",
  "ANGRY",
  "SCARED",
  "CONFUSED",
  "SUSPICIOUS",
  "EXCITED",
  "SURPRISED",
];

export const EMOTION_CONFIG: Record<
  DialogueEmotion,
  { label: string; icon: string; color: string }
> = {
  NEUTRAL: { label: "Neutral", icon: "😐", color: "text-slate-400" },
  HAPPY: { label: "Happy", icon: "😄", color: "text-emerald-400" },
  ANGRY: { label: "Angry", icon: "😡", color: "text-rose-400" },
  SCARED: { label: "Scared", icon: "😱", color: "text-indigo-400" },
  CONFUSED: { label: "Confused", icon: "🤔", color: "text-amber-400" },
  SUSPICIOUS: { label: "Suspicious", icon: "🧐", color: "text-yellow-400" },
  EXCITED: { label: "Excited", icon: "🤩", color: "text-cyan-400" },
  SURPRISED: { label: "Surprised", icon: "😲", color: "text-pink-400" },
};

export const CATEGORY_COLORS: Record<IdeaCategory, { bg: string; text: string; border: string }> = {
  MM2: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
  FUNNY: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
  STORY: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  TREND: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
  SHORT: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/30" },
  LONG_VIDEO: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/30" },
  OTHER: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30" },
};

export const CATEGORY_LABELS: Record<IdeaCategory, string> = {
  MM2: "MM2",
  FUNNY: "Funny",
  STORY: "Story",
  TREND: "Trend",
  SHORT: "Short",
  LONG_VIDEO: "Long Video",
  OTHER: "Other",
};

export const STATUS_COLORS: Record<IdeaStatus, { bg: string; text: string; dot: string }> = {
  IDEA: { bg: "bg-slate-800/60", text: "text-slate-300", dot: "bg-slate-400" },
  PLANNING: { bg: "bg-blue-900/40", text: "text-blue-300", dot: "bg-blue-400" },
  SCRIPTING: { bg: "bg-purple-900/40", text: "text-purple-300", dot: "bg-purple-400" },
  PRODUCTION: { bg: "bg-amber-900/40", text: "text-amber-300", dot: "bg-amber-400" },
  PUBLISHED: { bg: "bg-emerald-900/40", text: "text-emerald-300", dot: "bg-emerald-400" },
  ARCHIVED: { bg: "bg-zinc-800/40", text: "text-zinc-400", dot: "bg-zinc-500" },
};

export const STATUS_LABELS: Record<IdeaStatus, string> = {
  IDEA: "Idea",
  PLANNING: "Planning",
  SCRIPTING: "Scripting",
  PRODUCTION: "Production",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const STATUS_PROGRESSION: IdeaStatus[] = [
  "IDEA",
  "PLANNING",
  "SCRIPTING",
  "PRODUCTION",
  "PUBLISHED",
  "ARCHIVED",
];

export const PRIORITY_CONFIG: Record<
  IdeaPriority,
  { label: string; badgeVariant: "default" | "purple" | "amber" | "crimson"; glow?: boolean }
> = {
  LOW: { label: "Low", badgeVariant: "default" },
  MEDIUM: { label: "Medium", badgeVariant: "purple" },
  HIGH: { label: "High", badgeVariant: "amber" },
  HOT: { label: "HOT 🔥", badgeVariant: "crimson", glow: true },
};

export const ALL_CATEGORIES: IdeaCategory[] = [
  "MM2",
  "FUNNY",
  "STORY",
  "TREND",
  "SHORT",
  "LONG_VIDEO",
  "OTHER",
];

export const ALL_STATUSES: IdeaStatus[] = [
  "IDEA",
  "PLANNING",
  "SCRIPTING",
  "PRODUCTION",
  "PUBLISHED",
  "ARCHIVED",
];

export const ALL_PRIORITIES: IdeaPriority[] = ["LOW", "MEDIUM", "HIGH", "HOT"];

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview, quick stats & recent videos",
  },
  {
    title: "Ideas Hub",
    href: "/ideas",
    icon: Lightbulb,
    description: "Brainstorm, organize & track Roblox content ideas",
  },
  {
    title: "Videos",
    href: "/videos",
    icon: Video,
    description: "Manage YouTube & TikTok video assets and metadata",
  },
  {
    title: "Scripts",
    href: "/scripts",
    icon: FileText,
    description: "Structured scene-by-scene script editor",
  },
  {
    title: "Characters",
    href: "/characters",
    icon: Users,
    description: "Roblox avatar library, roles & personalities",
  },
  {
    title: "Content Calendar",
    href: "/calendar",
    icon: Calendar,
    description: "Visual scheduling & upload timetable",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "View trends, retention & engagement metrics",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Profile, themes, integrations & preferences",
  },
];



export const PLATFORM_CONFIG: Record<VideoPlatform, { label: string; color: string; badge: string }> = {
  YOUTUBE: { label: "YouTube", color: "#FF0000", badge: "bg-red-600/20 text-red-400 border-red-500/30" },
  YOUTUBE_SHORTS: { label: "YT Shorts", color: "#FF0000", badge: "bg-rose-600/20 text-rose-400 border-rose-500/30" },
  TIKTOK: { label: "TikTok", color: "#00F2FE", badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  ROBLOX: { label: "Roblox", color: "#00A2FF", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
};

export const DEFAULT_CREATOR = {
  id: "creator-roxie-1",
  name: "Roxie",
  handle: "@RoxiePlays",
  avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
  robloxUsername: "Roxie_StarCraft",
  streakDays: 14,
  primaryPlatform: "YOUTUBE" as VideoPlatform,
};
