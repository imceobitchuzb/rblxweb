"use server";

import { revalidatePath } from "next/cache";
import {
  createCalendarEventRecord,
  deleteCalendarEventRecord,
  getCalendarEvents,
  updateCalendarEventRecord,
} from "../../lib/server/calendar";
import { validateCalendarEventInput } from "../../lib/server/validation";
import { ActionResult, errorResult, successResult } from "../../lib/server/types";
import {
  CalendarEvent,
  CalendarEventStatus,
  CalendarEventType,
  VideoPlatform,
} from "../../lib/types";
import { getAuthContext } from "../../lib/auth/context";
import {
  assertPermission,
  canCreateContent,
  canDeleteContent,
  canEditContent,
} from "../../lib/auth/permissions";

export async function fetchCalendarEventsAction(): Promise<ActionResult<CalendarEvent[]>> {
  try {
    const ctx = await getAuthContext();
    const events = await getCalendarEvents(ctx.user.id, ctx.workspace.id);
    return successResult(events);
  } catch {
    return errorResult("Failed to fetch calendar events from database.");
  }
}

export async function createCalendarEventAction(data: {
  title: string;
  scheduledAt: string;
  type?: CalendarEventType;
  platform?: VideoPlatform;
  status?: CalendarEventStatus;
  videoId?: string;
  notes?: string;
}): Promise<ActionResult<CalendarEvent>> {
  try {
    const ctx = await getAuthContext();
    assertPermission(canCreateContent(ctx.role), "Unauthorized: Insufficient workspace permissions to create calendar events.");

    const validation = validateCalendarEventInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const created = await createCalendarEventRecord(data, ctx.user.id, ctx.workspace.id);
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    return successResult(created);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to persist calendar event.";
    return errorResult(message);
  }
}

export async function updateCalendarEventAction(
  id: string,
  data: Partial<Omit<CalendarEvent, "id" | "createdAt">>
): Promise<ActionResult<CalendarEvent>> {
  try {
    const ctx = await getAuthContext();
    assertPermission(canEditContent(ctx.role), "Unauthorized: Insufficient workspace permissions to edit calendar events.");

    const validation = validateCalendarEventInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const updated = await updateCalendarEventRecord(id, data, ctx.user.id, ctx.workspace.id);
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    return successResult(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update calendar event.";
    return errorResult(message);
  }
}

export async function deleteCalendarEventAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    assertPermission(canDeleteContent(ctx.role), "Unauthorized: Insufficient workspace permissions to delete calendar events.");

    const ok = await deleteCalendarEventRecord(id, ctx.user.id, ctx.workspace.id);
    if (!ok) {
      return errorResult("Calendar event not found or could not be removed.");
    }
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    return successResult({ id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete calendar event.";
    return errorResult(message);
  }
}
