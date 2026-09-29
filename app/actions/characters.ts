"use server";

import { revalidatePath } from "next/cache";
import {
  createCharacterRecord,
  deleteCharacterRecord,
  getCharacters,
  updateCharacterRecord,
} from "../../lib/server/characters";
import { validateCharacterInput } from "../../lib/server/validation";
import { ActionResult, errorResult, successResult } from "../../lib/server/types";
import { Character, CharacterRole } from "../../lib/types";
import { getAuthContext } from "../../lib/auth/context";
import {
  assertPermission,
  canCreateContent,
  canDeleteContent,
  canEditContent,
} from "../../lib/auth/permissions";

export async function fetchCharactersAction(): Promise<ActionResult<Character[]>> {
  try {
    const ctx = await getAuthContext();
    const characters = await getCharacters(ctx.user.id, ctx.workspace.id);
    return successResult(characters);
  } catch {
    return errorResult("Failed to fetch characters from database.");
  }
}

export async function createCharacterAction(data: {
  name: string;
  role?: CharacterRole;
  description?: string;
  personality?: string;
  outfit?: string;
  avatar?: string;
  notes?: string;
  tags?: string[];
}): Promise<ActionResult<Character>> {
  try {
    const ctx = await getAuthContext();
    assertPermission(canCreateContent(ctx.role), "Unauthorized: Insufficient workspace permissions to create characters.");

    const validation = validateCharacterInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const created = await createCharacterRecord(data, ctx.user.id, ctx.workspace.id);
    revalidatePath("/characters");
    revalidatePath("/scripts");
    revalidatePath("/dashboard");
    return successResult(created);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to persist character.";
    return errorResult(message);
  }
}

export async function updateCharacterAction(
  id: string,
  data: Partial<Omit<Character, "id" | "createdAt">>
): Promise<ActionResult<Character>> {
  try {
    const ctx = await getAuthContext();
    assertPermission(canEditContent(ctx.role), "Unauthorized: Insufficient workspace permissions to edit characters.");

    const validation = validateCharacterInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const updated = await updateCharacterRecord(id, data, ctx.user.id, ctx.workspace.id);
    revalidatePath("/characters");
    revalidatePath("/scripts");
    return successResult(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update character.";
    return errorResult(message);
  }
}

export async function deleteCharacterAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getAuthContext();
    assertPermission(canDeleteContent(ctx.role), "Unauthorized: Insufficient workspace permissions to delete characters.");

    const ok = await deleteCharacterRecord(id, ctx.user.id, ctx.workspace.id);
    if (!ok) {
      return errorResult("Character not found or could not be removed.");
    }
    revalidatePath("/characters");
    revalidatePath("/scripts");
    revalidatePath("/dashboard");
    return successResult({ id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete character.";
    return errorResult(message);
  }
}
