import {
  CalendarEvent,
  CalendarEventStatus,
  CalendarEventType,
  Script,
  Video,
  VideoPlatform,
  VideoStatus,
} from "./types";

export interface VideoFilterOptions {
  search?: string;
  status?: VideoStatus | "ALL";
  platform?: VideoPlatform | "ALL";
  sortBy?: "date" | "views" | "duration" | "title";
  sortOrder?: "asc" | "desc";
}

export interface CalendarFilterOptions {
  search?: string;
  status?: CalendarEventStatus | "ALL";
  platform?: VideoPlatform | "ALL";
  type?: CalendarEventType | "ALL";
}

/**
 * Formats a duration in seconds into MM:SS or HH:MM:SS.
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Formats numerical metrics into human-readable compact notation (e.g. 1.2M, 45.2K).
 */
export function formatMetric(num: number): string {
  if (isNaN(num) || num === 0) return "0";
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

/**
 * Filters and sorts videos based on creator preferences.
 */
export function filterVideos(videos: Video[], options: VideoFilterOptions = {}): Video[] {
  const {
    search = "",
    status = "ALL",
    platform = "ALL",
    sortBy = "date",
    sortOrder = "desc",
  } = options;

  const query = search.trim().toLowerCase();

  const filtered = videos.filter((video) => {
    // Status filter
    if (status !== "ALL" && video.status !== status) {
      return false;
    }

    // Platform filter
    if (platform !== "ALL" && video.platform !== platform) {
      return false;
    }

    // Search query matches title, description, or tags
    if (query) {
      const titleMatch = video.title.toLowerCase().includes(query);
      const descMatch = video.description.toLowerCase().includes(query);
      const tagMatch = video.tags.some((tag) => tag.toLowerCase().includes(query));
      if (!titleMatch && !descMatch && !tagMatch) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  return filtered.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "views":
        comparison = (a.views || 0) - (b.views || 0);
        break;
      case "duration":
        comparison = (a.duration || 0) - (b.duration || 0);
        break;
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "date":
      default: {
        const timeA = new Date(a.publishedAt || a.scheduledAt || a.createdAt).getTime();
        const timeB = new Date(b.publishedAt || b.scheduledAt || b.createdAt).getTime();
        comparison = timeA - timeB;
        break;
      }
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });
}

/**
 * Filters calendar events according to search query, platform, type, and status.
 */
export function filterCalendarEvents(
  events: CalendarEvent[],
  options: CalendarFilterOptions = {}
): CalendarEvent[] {
  const { search = "", status = "ALL", platform = "ALL", type = "ALL" } = options;
  const query = search.trim().toLowerCase();

  return events.filter((event) => {
    if (status !== "ALL" && event.status !== status) {
      return false;
    }
    if (platform !== "ALL" && event.platform !== platform) {
      return false;
    }
    if (type !== "ALL" && event.type !== type) {
      return false;
    }
    if (query) {
      const titleMatch = event.title.toLowerCase().includes(query);
      const notesMatch = event.notes ? event.notes.toLowerCase().includes(query) : false;
      if (!titleMatch && !notesMatch) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Returns upcoming events sorted chronologically.
 */
export function getUpcomingEvents(
  events: CalendarEvent[],
  limit: number = 5,
  referenceDate: Date = new Date("2026-09-29T12:00:00.000Z")
): CalendarEvent[] {
  const refTime = referenceDate.getTime();
  return events
    .filter((e) => {
      if (e.status === "PUBLISHED" || e.status === "CANCELLED") return false;
      const scheduledTime = new Date(e.scheduledAt).getTime();
      return scheduledTime >= refTime;
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, limit);
}

/**
 * Formats standard date display (e.g. "Sep 30, 2026" or "Wed, Sep 30")
 */
export function formatDate(
  dateInput: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return d.toLocaleDateString("en-US", options || {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats time display (e.g. "5:00 PM")
 */
export function formatTime(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

/**
 * Validates video creation / edit form inputs.
 */
export function validateVideoForm(data: Partial<Video>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = "Title is required";
  } else if (data.title.trim().length > 120) {
    errors.title = "Title must not exceed 120 characters";
  }

  if (!data.platform) {
    errors.platform = "Platform is required";
  }

  if (!data.status) {
    errors.status = "Status is required";
  }

  if (data.duration !== undefined && (isNaN(data.duration) || data.duration < 0)) {
    errors.duration = "Duration must be a positive number";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Creates a new video scaffold prefilled from an existing script.
 */
export function createVideoFromScript(
  script: Script,
  platform: VideoPlatform = "YOUTUBE_SHORTS"
): Partial<Video> {
  return {
    title: script.title,
    description: script.description || `Script: ${script.title}. Hook: ${script.hook}`,
    status: "READY",
    platform,
    duration: script.estimatedDuration || 60,
    scriptId: script.id,
    ideaId: script.ideaId,
    characterIds: [...script.characters],
    tags: [...script.tags],
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
    views: 0,
    likes: 0,
    comments: 0,
  };
}

/**
 * Creates a calendar event linked to a video schedule.
 */
export function createScheduleEventFromVideo(
  video: Video,
  scheduledAt: string,
  notes?: string
): CalendarEvent {
  const now = new Date().toISOString();
  return {
    id: `cal-gen-${Date.now()}`,
    title: video.title,
    type: "VIDEO",
    videoId: video.id,
    platform: video.platform,
    status: "PLANNED",
    scheduledAt,
    notes: notes || `Scheduled release for ${video.platform}`,
    createdAt: now,
    updatedAt: now,
  };
}

export interface CalendarDayCell {
  date: Date;
  dateKey: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

/**
 * Builds the 35 or 42 grid cells for Month View.
 */
export function getMonthGrid(
  year: number,
  month: number, // 0-indexed (0 = Jan, 8 = Sep, 9 = Oct)
  events: CalendarEvent[],
  today: Date = new Date("2026-09-29T12:00:00.000Z")
): CalendarDayCell[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Sunday = 0, Monday = 1, etc.
  const startDayOfWeek = firstDayOfMonth.getDay();
  const totalDaysInMonth = lastDayOfMonth.getDate();

  const cells: CalendarDayCell[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year, month - 1, day);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvents = events.filter((e) => e.scheduledAt.startsWith(dateKey));
    cells.push({
      date,
      dateKey,
      dayNumber: day,
      isCurrentMonth: false,
      isToday:
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate(),
      events: dayEvents,
    });
  }

  // Current month days
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvents = events.filter((e) => e.scheduledAt.startsWith(dateKey));
    cells.push({
      date,
      dateKey,
      dayNumber: day,
      isCurrentMonth: true,
      isToday:
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate(),
      events: dayEvents,
    });
  }

  // Next month leading days to complete full weeks (up to multiple of 7)
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(year, month + 1, day);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvents = events.filter((e) => e.scheduledAt.startsWith(dateKey));
    cells.push({
      date,
      dateKey,
      dayNumber: day,
      isCurrentMonth: false,
      isToday:
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate(),
      events: dayEvents,
    });
  }

  return cells;
}

/**
 * Builds the 7 days for Week View based on a reference date.
 */
export function getWeekDays(
  referenceDate: Date,
  events: CalendarEvent[],
  today: Date = new Date("2026-09-29T12:00:00.000Z")
): CalendarDayCell[] {
  const currentDay = referenceDate.getDay();
  // Start on Sunday
  const startOfWeek = new Date(referenceDate);
  startOfWeek.setDate(referenceDate.getDate() - currentDay);

  const days: CalendarDayCell[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dayEvents = events.filter((e) => e.scheduledAt.startsWith(dateKey));
    days.push({
      date: d,
      dateKey,
      dayNumber: d.getDate(),
      isCurrentMonth: true,
      isToday:
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate(),
      events: dayEvents,
    });
  }
  return days;
}
