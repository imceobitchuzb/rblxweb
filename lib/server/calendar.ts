import { prisma } from "../prisma";
import {
  CalendarEvent,
  CalendarEventStatus,
  CalendarEventType,
  VideoPlatform,
} from "../types";
import { getCurrentUserId, getCurrentWorkspaceId } from "./user-context";
import { memoryStore, assertPersistentDatabase } from "./store";

function mapPrismaEventToItem(evt: {
  id: string;
  videoId: string | null;
  title: string;
  type: string;
  platform: string;
  status: string;
  scheduledAt: Date;
  notes: string | null;
  workspaceId?: string | null;
  userId?: string;
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
    workspaceId: evt.workspaceId || undefined,
    userId: evt.userId,
    createdAt: evt.createdAt.toISOString(),
    updatedAt: evt.updatedAt.toISOString(),
  };
}

export async function getCalendarEvents(
  userId?: string,
  workspaceId?: string
): Promise<CalendarEvent[]> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

  try {
    const events = await prisma.calendarEvent.findMany({
      where: {
        OR: [
          { workspaceId: activeWorkspaceId },
          { workspaceId: null, userId: activeUserId },
        ],
      },
      orderBy: { scheduledAt: "asc" },
    });
    return events.map(mapPrismaEventToItem);
  } catch (err) {
    assertPersistentDatabase("getCalendarEvents", err);
    return memoryStore.calendarEvents.filter((e) =>
      e.workspaceId ? e.workspaceId === activeWorkspaceId : e.userId === activeUserId
    );
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
  userId?: string,
  workspaceId?: string
): Promise<CalendarEvent> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

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
        workspaceId: activeWorkspaceId,
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
  } catch (err) {
    assertPersistentDatabase("createCalendarEventRecord", err);
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
      workspaceId: activeWorkspaceId,
      userId: activeUserId,
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
  userId?: string,
  workspaceId?: string
): Promise<CalendarEvent> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

  try {
    const existing = await prisma.calendarEvent.findFirst({
      where: {
        id,
        OR: [
          { workspaceId: activeWorkspaceId },
          { workspaceId: null, userId: activeUserId },
        ],
      },
    });
    if (!existing) {
      throw new Error(`Calendar event not found: ${id}`);
    }

    const updated = await prisma.calendarEvent.update({
      where: { id: existing.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.scheduledAt !== undefined ? { scheduledAt: new Date(data.scheduledAt) } : {}),
        ...(data.type !== undefined ? { type: data.type as never } : {}),
        ...(data.platform !== undefined ? { platform: data.platform as never } : {}),
        ...(data.status !== undefined ? { status: data.status as never } : {}),
        ...(data.videoId !== undefined ? { videoId: data.videoId } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
    });
    const mapped = mapPrismaEventToItem(updated);
    const idx = memoryStore.calendarEvents.findIndex(
      (e) =>
        e.id === id &&
        (e.workspaceId ? e.workspaceId === activeWorkspaceId : e.userId === activeUserId)
    );
    if (idx !== -1) memoryStore.calendarEvents[idx] = mapped;
    return mapped;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Calendar event not found")) {
      throw err;
    }
    assertPersistentDatabase("updateCalendarEventRecord", err);
    const idx = memoryStore.calendarEvents.findIndex(
      (e) =>
        e.id === id &&
        (e.workspaceId ? e.workspaceId === activeWorkspaceId : e.userId === activeUserId)
    );
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
  userId?: string,
  workspaceId?: string
): Promise<boolean> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

  try {
    const existing = await prisma.calendarEvent.findFirst({
      where: {
        id,
        OR: [
          { workspaceId: activeWorkspaceId },
          { workspaceId: null, userId: activeUserId },
        ],
      },
    });
    if (!existing) {
      return false;
    }

    await prisma.calendarEvent.delete({
      where: { id: existing.id },
    });
    memoryStore.calendarEvents = memoryStore.calendarEvents.filter(
      (e) =>
        !(e.id === id && (e.workspaceId ? e.workspaceId === activeWorkspaceId : e.userId === activeUserId))
    );
    return true;
  } catch (err) {
    assertPersistentDatabase("deleteCalendarEventRecord", err);
    const initialLen = memoryStore.calendarEvents.length;
    memoryStore.calendarEvents = memoryStore.calendarEvents.filter(
      (e) =>
        !(e.id === id && (e.workspaceId ? e.workspaceId === activeWorkspaceId : e.userId === activeUserId))
    );
    return memoryStore.calendarEvents.length < initialLen;
  }
}

export async function rescheduleCalendarEventRecord(
  id: string,
  newScheduledAt: string,
  userId?: string,
  workspaceId?: string
): Promise<CalendarEvent> {
  return updateCalendarEventRecord(id, { scheduledAt: newScheduledAt }, userId, workspaceId);
}
