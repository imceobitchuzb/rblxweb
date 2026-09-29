import { prisma } from "../prisma";
import {
  CalendarEvent,
  CalendarEventStatus,
  CalendarEventType,
  VideoPlatform,
} from "../types";
import { getCurrentUserId } from "./user-context";
import { memoryStore } from "./store";

function mapPrismaEventToItem(evt: {
  id: string;
  videoId: string | null;
  title: string;
  type: string;
  platform: string;
  status: string;
  scheduledAt: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): CalendarEvent {
  return {
    id: evt.id,
    videoId: evt.videoId || undefined,
    title: evt.title,
    type: evt.type as CalendarEventType,
    platform: evt.platform as VideoPlatform,
    status: evt.status as CalendarEventStatus,
    scheduledAt: evt.scheduledAt.toISOString(),
    notes: evt.notes || undefined,
    createdAt: evt.createdAt.toISOString(),
    updatedAt: evt.updatedAt.toISOString(),
  };
}

export async function getCalendarEvents(userId?: string): Promise<CalendarEvent[]> {
  const activeUserId = userId || (await getCurrentUserId());

  try {
    const events = await prisma.calendarEvent.findMany({
      where: { userId: activeUserId },
      orderBy: { scheduledAt: "asc" },
    });
    return events.map(mapPrismaEventToItem);
  } catch {
    return memoryStore.calendarEvents;
  }
}

export async function createCalendarEventRecord(
  data: {
    title: string;
    scheduledAt: string;
    type?: CalendarEventType;
    platform?: VideoPlatform;
    status?: CalendarEventStatus;
    videoId?: string;
    notes?: string;
  },
  userId?: string
): Promise<CalendarEvent> {
  const activeUserId = userId || (await getCurrentUserId());

  try {
    await prisma.user.upsert({
      where: { id: activeUserId },
      update: {},
      create: {
        id: activeUserId,
        email: "creator@roxiehub.gg",
        name: "Roxie Velocity",
      },
    });

    const created = await prisma.calendarEvent.create({
      data: {
        userId: activeUserId,
        title: data.title,
        scheduledAt: new Date(data.scheduledAt),
        type: (data.type || "VIDEO") as never,
        platform: (data.platform || "YOUTUBE") as never,
        status: (data.status || "PLANNED") as never,
        videoId: data.videoId || null,
        notes: data.notes || null,
      },
    });
    const mapped = mapPrismaEventToItem(created);
    memoryStore.calendarEvents.push(mapped);
    return mapped;
  } catch {
    const now = new Date().toISOString();
    const fallback: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: data.title,
      scheduledAt: data.scheduledAt,
      type: data.type || "VIDEO",
      platform: data.platform || "YOUTUBE",
      status: data.status || "PLANNED",
      videoId: data.videoId,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.calendarEvents.push(fallback);
    return fallback;
  }
}

export async function updateCalendarEventRecord(
  id: string,
  data: Partial<Omit<CalendarEvent, "id" | "createdAt">>,
  userId?: string
): Promise<CalendarEvent> {
  const activeUserId = userId || (await getCurrentUserId());

  try {
    const updated = await prisma.calendarEvent.update({
      where: { id, userId: activeUserId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.type !== undefined ? { type: data.type as never } : {}),
        ...(data.platform !== undefined ? { platform: data.platform as never } : {}),
        ...(data.status !== undefined ? { status: data.status as never } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.videoId !== undefined ? { videoId: data.videoId || null } : {}),
        ...(data.scheduledAt !== undefined
          ? { scheduledAt: new Date(data.scheduledAt) }
          : {}),
      },
    });
    const mapped = mapPrismaEventToItem(updated);
    const idx = memoryStore.calendarEvents.findIndex((e) => e.id === id);
    if (idx !== -1) memoryStore.calendarEvents[idx] = mapped;
    return mapped;
  } catch {
    const idx = memoryStore.calendarEvents.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Calendar event not found: ${id}`);
    const updated: CalendarEvent = {
      ...memoryStore.calendarEvents[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    memoryStore.calendarEvents[idx] = updated;
    return updated;
  }
}

export async function deleteCalendarEventRecord(
  id: string,
  userId?: string
): Promise<boolean> {
  const activeUserId = userId || (await getCurrentUserId());

  try {
    await prisma.calendarEvent.delete({
      where: { id, userId: activeUserId },
    });
    memoryStore.calendarEvents = memoryStore.calendarEvents.filter((e) => e.id !== id);
    return true;
  } catch {
    const initialLen = memoryStore.calendarEvents.length;
    memoryStore.calendarEvents = memoryStore.calendarEvents.filter((e) => e.id !== id);
    return memoryStore.calendarEvents.length < initialLen;
  }
}
