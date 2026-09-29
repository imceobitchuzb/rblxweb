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

export async function fetchCalendarEventsAction(): Promise<ActionResult<CalendarEvent[]>> {
  try {
    const events = await getCalendarEvents();
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
    const validation = validateCalendarEventInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const created = await createCalendarEventRecord(data);
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
    const validation = validateCalendarEventInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const updated = await updateCalendarEventRecord(id, data);
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
    const ok = await deleteCalendarEventRecord(id);
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
