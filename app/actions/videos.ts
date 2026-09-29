"use server";

import { revalidatePath } from "next/cache";
import {
  createVideoRecord,
  deleteVideoRecord,
  getVideos,
  updateVideoRecord,
} from "../../lib/server/videos";
import { validateVideoInput } from "../../lib/server/validation";
import { ActionResult, errorResult, successResult } from "../../lib/server/types";
import { Video, VideoPlatform, VideoStatus } from "../../lib/types";
import { getAuthContext } from "../../lib/auth/context";
import {
  assertPermission,
  canCreateContent,
  canDeleteContent,
  canEditContent,
} from "../../lib/auth/permissions";

export async function fetchVideosAction(): Promise<ActionResult<Video[]>> {
  try {
    const ctx = await getAuthContext();
    const videos = await getVideos(ctx.user.id, ctx.workspace.id);
    return successResult(videos);
  } catch {
    return errorResult("Failed to fetch videos from database.");
  }
}

export async function createVideoAction(data: {
  title: string;
  description?: string;
  platform?: VideoPlatform;
  status?: VideoStatus;
  thumbnail?: string;
  duration?: number;
  scriptId?: string;
  ideaId?: string;
  tags?: string[];
  characterIds?: string[];
  scheduledAt?: string;
  publishedAt?: string;
  url?: string;
}): Promise<ActionResult<Video>> {
  try {
    const ctx = await getAuthContext();
    assertPermission(canCreateContent(ctx.role), "Unauthorized: Insufficient workspace permissions to create videos.");

    const validation = validateVideoInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const created = await createVideoRecord(data, ctx.user.id, ctx.workspace.id);
    revalidatePath("/videos");
    revalidatePath("/calendar");
    revalidatePath("/analytics");
    revalidatePath("/dashboard");
    return successResult(created);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to persist video.";
    return errorResult(message);
  }
}

export async function updateVideoAction(
  id: string,
  data: Partial<Omit<Video, "id" | "createdAt">>
): Promise<ActionResult<Video>> {
  try {
    const ctx = await getAuthContext();
    assertPermission(canEditContent(ctx.role), "Unauthorized: Insufficient workspace permissions to edit videos.");

    const validation = validateVideoInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const updated = await updateVideoRecord(id, data, ctx.user.id, ctx.workspace.id);
    revalidatePath("/videos");
    revalidatePath("/calendar");
    revalidatePath("/analytics");
    revalidatePath("/dashboard");
    return successResult(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update video.";
    return errorResult(message);
  }
}

export async function deleteVideoAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    assertPermission(canDeleteContent(ctx.role), "Unauthorized: Insufficient workspace permissions to delete videos.");

    const ok = await deleteVideoRecord(id, ctx.user.id, ctx.workspace.id);
    if (!ok) {
      return errorResult("Video not found or could not be removed.");
    }
    revalidatePath("/videos");
    revalidatePath("/calendar");
    revalidatePath("/analytics");
    revalidatePath("/dashboard");
    return successResult({ id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete video.";
    return errorResult(message);
  }
}
