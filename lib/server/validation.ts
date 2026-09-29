import {
  CalendarEventStatus,
  CalendarEventType,
  CharacterRole,
  DialogueEmotion,
  IdeaCategory,
  IdeaPriority,
  IdeaStatus,
  ScriptStatus,
  VideoPlatform,
  VideoStatus,
} from "../types";

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

export function createValidationResult(issues: ValidationIssue[]): ValidationResult {
  if (issues.length === 0) {
    return { valid: true, errors: {} };
  }

  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    if (!errors[issue.field]) {
      errors[issue.field] = [];
    }
    errors[issue.field].push(issue.message);
  }

  return { valid: false, errors };
}

// 1. Ideas Validation
const VALID_IDEA_CATEGORIES = new Set<IdeaCategory>([
  "MM2",
  "FUNNY",
  "STORY",
  "TREND",
  "SHORT",
  "LONG_VIDEO",
  "OTHER",
]);

const VALID_IDEA_STATUSES = new Set<IdeaStatus>([
  "IDEA",
  "PLANNING",
  "SCRIPTING",
  "PRODUCTION",
  "PUBLISHED",
  "ARCHIVED",
]);

const VALID_IDEA_PRIORITIES = new Set<IdeaPriority>([
  "LOW",
  "MEDIUM",
  "HIGH",
  "HOT",
]);

export function validateIdeaInput(data: {
  title?: unknown;
  description?: unknown;
  category?: unknown;
  status?: unknown;
  priority?: unknown;
  potentialScore?: unknown;
  tags?: unknown;
}): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (typeof data.title !== "string" || !data.title.trim()) {
    issues.push({ field: "title", message: "Idea title is required." });
  } else if (data.title.trim().length < 2) {
    issues.push({ field: "title", message: "Title must be at least 2 characters." });
  } else if (data.title.trim().length > 200) {
    issues.push({ field: "title", message: "Title cannot exceed 200 characters." });
  }

  if (data.description !== undefined && typeof data.description !== "string") {
    issues.push({ field: "description", message: "Description must be a text string." });
  }

  if (data.category !== undefined && !VALID_IDEA_CATEGORIES.has(data.category as IdeaCategory)) {
    issues.push({ field: "category", message: `Invalid category: ${String(data.category)}` });
  }

  if (data.status !== undefined && !VALID_IDEA_STATUSES.has(data.status as IdeaStatus)) {
    issues.push({ field: "status", message: `Invalid status: ${String(data.status)}` });
  }

  if (data.priority !== undefined && !VALID_IDEA_PRIORITIES.has(data.priority as IdeaPriority)) {
    issues.push({ field: "priority", message: `Invalid priority: ${String(data.priority)}` });
  }

  if (data.potentialScore !== undefined) {
    const score = Number(data.potentialScore);
    if (isNaN(score) || score < 1 || score > 10) {
      issues.push({ field: "potentialScore", message: "Viral potential score must be an integer between 1 and 10." });
    }
  }

  return createValidationResult(issues);
}

// 2. Characters Validation
const VALID_CHARACTER_ROLES = new Set<CharacterRole>([
  "MAIN",
  "SUPPORTING",
  "VILLAIN",
  "NPC",
  "SPECIAL_GUEST",
]);

export function validateCharacterInput(data: {
  name?: unknown;
  role?: unknown;
  personality?: unknown;
  description?: unknown;
  outfit?: unknown;
  avatar?: unknown;
  notes?: unknown;
  tags?: unknown;
}): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (typeof data.name !== "string" || !data.name.trim()) {
    issues.push({ field: "name", message: "Character name is required." });
  } else if (data.name.trim().length < 2) {
    issues.push({ field: "name", message: "Name must be at least 2 characters." });
  } else if (data.name.trim().length > 100) {
    issues.push({ field: "name", message: "Name cannot exceed 100 characters." });
  }

  if (data.role !== undefined && !VALID_CHARACTER_ROLES.has(data.role as CharacterRole)) {
    issues.push({ field: "role", message: `Invalid character role: ${String(data.role)}` });
  }

  return createValidationResult(issues);
}

// 3. Scripts Validation
const VALID_SCRIPT_STATUSES = new Set<ScriptStatus>([
  "DRAFT",
  "SCRIPTING",
  "READY",
  "IN_PRODUCTION",
  "COMPLETED",
  "ARCHIVED",
]);

export function validateScriptInput(data: {
  title?: unknown;
  status?: unknown;
  hook?: unknown;
  estimatedDuration?: unknown;
}): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (typeof data.title !== "string" || !data.title.trim()) {
    issues.push({ field: "title", message: "Script title is required." });
  } else if (data.title.trim().length < 2) {
    issues.push({ field: "title", message: "Title must be at least 2 characters." });
  }

  if (data.status !== undefined && !VALID_SCRIPT_STATUSES.has(data.status as ScriptStatus)) {
    issues.push({ field: "status", message: `Invalid script status: ${String(data.status)}` });
  }

  if (data.estimatedDuration !== undefined) {
    const dur = Number(data.estimatedDuration);
    if (isNaN(dur) || dur < 0) {
      issues.push({ field: "estimatedDuration", message: "Estimated duration must be a non-negative number." });
    }
  }

  return createValidationResult(issues);
}

// 4. Scenes Validation
export function validateSceneInput(data: {
  title?: unknown;
  duration?: unknown;
}): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (typeof data.title !== "string" || !data.title.trim()) {
    issues.push({ field: "title", message: "Scene title is required." });
  }

  if (data.duration !== undefined) {
    const dur = Number(data.duration);
    if (isNaN(dur) || dur < 0) {
      issues.push({ field: "duration", message: "Scene duration must be a non-negative number." });
    }
  }

  return createValidationResult(issues);
}

// 5. Dialogue Line Validation
const VALID_DIALOGUE_EMOTIONS = new Set<DialogueEmotion>([
  "NEUTRAL",
  "HAPPY",
  "ANGRY",
  "SCARED",
  "CONFUSED",
  "SUSPICIOUS",
  "EXCITED",
  "SURPRISED",
]);

export function validateDialogueInput(data: {
  characterId?: unknown;
  text?: unknown;
  emotion?: unknown;
  duration?: unknown;
}): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (typeof data.characterId !== "string" || !data.characterId.trim()) {
    issues.push({ field: "characterId", message: "Character ID is required for dialogue." });
  }

  if (typeof data.text !== "string" || !data.text.trim()) {
    issues.push({ field: "text", message: "Dialogue line cannot be empty." });
  }

  if (data.emotion !== undefined && !VALID_DIALOGUE_EMOTIONS.has(data.emotion as DialogueEmotion)) {
    issues.push({ field: "emotion", message: `Invalid dialogue emotion: ${String(data.emotion)}` });
  }

  if (data.duration !== undefined) {
    const dur = Number(data.duration);
    if (isNaN(dur) || dur <= 0) {
      issues.push({ field: "duration", message: "Dialogue duration must be greater than 0 seconds." });
    }
  }

  return createValidationResult(issues);
}

// 6. Videos Validation
const VALID_VIDEO_PLATFORMS = new Set<VideoPlatform>([
  "YOUTUBE",
  "YOUTUBE_SHORTS",
  "TIKTOK",
  "INSTAGRAM_REELS",
]);

const VALID_VIDEO_STATUSES = new Set<VideoStatus>([
  "PLANNING",
  "IN_PRODUCTION",
  "EDITING",
  "READY",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
]);

export function validateVideoInput(data: {
  title?: unknown;
  platform?: unknown;
  status?: unknown;
  duration?: unknown;
}): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (typeof data.title !== "string" || !data.title.trim()) {
    issues.push({ field: "title", message: "Video title is required." });
  } else if (data.title.trim().length < 2) {
    issues.push({ field: "title", message: "Title must be at least 2 characters." });
  }

  if (data.platform !== undefined && !VALID_VIDEO_PLATFORMS.has(data.platform as VideoPlatform)) {
    issues.push({ field: "platform", message: `Invalid video platform: ${String(data.platform)}` });
  }

  if (data.status !== undefined && !VALID_VIDEO_STATUSES.has(data.status as VideoStatus)) {
    issues.push({ field: "status", message: `Invalid video status: ${String(data.status)}` });
  }

  if (data.duration !== undefined) {
    const dur = Number(data.duration);
    if (isNaN(dur) || dur < 0) {
      issues.push({ field: "duration", message: "Video duration must be a non-negative number." });
    }
  }

  return createValidationResult(issues);
}

// 7. Calendar Events Validation
const VALID_CALENDAR_TYPES = new Set<CalendarEventType>([
  "VIDEO",
  "UPLOAD",
  "PREMIERE",
  "IDEA",
  "DEADLINE",
]);

const VALID_CALENDAR_STATUSES = new Set<CalendarEventStatus>([
  "PLANNED",
  "READY",
  "PUBLISHED",
  "CANCELLED",
]);

export function validateCalendarEventInput(data: {
  title?: unknown;
  scheduledAt?: unknown;
  type?: unknown;
  status?: unknown;
}): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (typeof data.title !== "string" || !data.title.trim()) {
    issues.push({ field: "title", message: "Calendar event title is required." });
  }

  if (typeof data.scheduledAt !== "string" || !data.scheduledAt.trim() || isNaN(Date.parse(data.scheduledAt))) {
    issues.push({ field: "scheduledAt", message: "Valid scheduled date is required." });
  }

  if (data.type !== undefined && !VALID_CALENDAR_TYPES.has(data.type as CalendarEventType)) {
    issues.push({ field: "type", message: `Invalid calendar event type: ${String(data.type)}` });
  }

  if (data.status !== undefined && !VALID_CALENDAR_STATUSES.has(data.status as CalendarEventStatus)) {
    issues.push({ field: "status", message: `Invalid calendar status: ${String(data.status)}` });
  }

  return createValidationResult(issues);
}

// 5. Auth Validation
export function validateRegisterInput(data: {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  workspaceName?: unknown;
}): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (typeof data.name !== "string" || !data.name.trim() || data.name.trim().length < 2) {
    issues.push({ field: "name", message: "Name must be at least 2 characters long." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof data.email !== "string" || !emailRegex.test(data.email.trim())) {
    issues.push({ field: "email", message: "A valid email address is required." });
  }

  if (typeof data.password !== "string" || data.password.length < 8) {
    issues.push({ field: "password", message: "Password must be at least 8 characters long." });
  }

  return createValidationResult(issues);
}

export function validateLoginInput(data: {
  email?: unknown;
  password?: unknown;
}): ValidationResult {
  const issues: ValidationIssue[] = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof data.email !== "string" || !emailRegex.test(data.email.trim())) {
    issues.push({ field: "email", message: "A valid email address is required." });
  }

  if (typeof data.password !== "string" || !data.password) {
    issues.push({ field: "password", message: "Password is required." });
  }

  return createValidationResult(issues);
}
