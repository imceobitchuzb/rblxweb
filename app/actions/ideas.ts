"use server";

import { revalidatePath } from "next/cache";
import {
  advanceIdeaStatusRecord,
  createIdeaRecord,
  deleteIdeaRecord,
  getIdeas,
  updateIdeaRecord,
} from "../../lib/server/ideas";
import { validateIdeaInput } from "../../lib/server/validation";
import { ActionResult, errorResult, successResult } from "../../lib/server/types";
import { IdeaItem } from "../../lib/types";
import { getAuthContext } from "../../lib/auth/context";
import {
  assertPermission,
  canCreateContent,
  canDeleteContent,
  canEditContent,
} from "../../lib/auth/permissions";

export async function fetchIdeasAction(): Promise<ActionResult<IdeaItem[]>> {
  try {
    const ctx = await getAuthContext();
    const ideas = await getIdeas(ctx.user.id, ctx.workspace.id);
    return successResult(ideas);
  } catch {
    return errorResult("Failed to fetch ideas from database.");
  }
}

export async function createIdeaAction(data: {
  title: string;
  description?: string;
  category?: IdeaItem["category"];
  status?: IdeaItem["status"];
  priority?: IdeaItem["priority"];
  tags?: string[];
  potentialScore?: number;
}): Promise<ActionResult<IdeaItem>> {
  try {
    const ctx = await getAuthContext();
    assertPermission(canCreateContent(ctx.role), "Unauthorized: Insufficient workspace permissions to create ideas.");

    const validation = validateIdeaInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const created = await createIdeaRecord(data, ctx.user.id, ctx.workspace.id);
    revalidatePath("/ideas");
    revalidatePath("/dashboard");
    return successResult(created);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to persist idea.";
    return errorResult(message);
  }
}

export async function updateIdeaAction(
  id: string,
  data: Partial<Omit<IdeaItem, "id" | "createdAt">>
): Promise<ActionResult<IdeaItem>> {
  try {
    const ctx = await getAuthContext();
    assertPermission(canEditContent(ctx.role), "Unauthorized: Insufficient workspace permissions to edit ideas.");

    const validation = validateIdeaInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const updated = await updateIdeaRecord(id, data, ctx.user.id, ctx.workspace.id);
    revalidatePath("/ideas");
    revalidatePath("/dashboard");
    return successResult(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update idea.";
    return errorResult(message);
  }
}

export async function deleteIdeaAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    assertPermission(canDeleteContent(ctx.role), "Unauthorized: Insufficient workspace permissions to delete ideas.");

    const ok = await deleteIdeaRecord(id, ctx.user.id, ctx.workspace.id);
    if (!ok) {
      return errorResult("Idea not found or could not be removed.");
    }
    revalidatePath("/ideas");
    revalidatePath("/dashboard");
    return successResult({ id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete idea.";
    return errorResult(message);
  }
}

export async function advanceIdeaStatusAction(id: string): Promise<ActionResult<IdeaItem>> {
  try {
    const ctx = await getAuthContext();
    assertPermission(canEditContent(ctx.role), "Unauthorized: Insufficient workspace permissions to advance ideas.");

    const updated = await advanceIdeaStatusRecord(id, ctx.user.id, ctx.workspace.id);
    revalidatePath("/ideas");
    revalidatePath("/dashboard");
    return successResult(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to advance idea status.";
    return errorResult(message);
  }
}
