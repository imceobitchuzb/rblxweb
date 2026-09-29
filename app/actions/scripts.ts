"use server";

import { revalidatePath } from "next/cache";
import {
  createDialogueLineRecord,
  createSceneRecord,
  createScriptRecord,
  deleteDialogueLineRecord,
  deleteSceneRecord,
  deleteScriptRecord,
  getScripts,
  reorderScenesRecord,
  updateDialogueLineRecord,
  updateSceneRecord,
  updateScriptRecord,
} from "../../lib/server/scripts";
import {
  validateDialogueInput,
  validateSceneInput,
  validateScriptInput,
} from "../../lib/server/validation";
import { ActionResult, errorResult, successResult } from "../../lib/server/types";
import { DialogueEmotion, DialogueLine, Scene, Script, ScriptStatus } from "../../lib/types";

export async function fetchScriptsAction(): Promise<ActionResult<Script[]>> {
  try {
    const scripts = await getScripts();
    return successResult(scripts);
  } catch {
    return errorResult("Failed to fetch screenplays from database.");
  }
}

export async function createScriptAction(data: {
  ideaId?: string;
  title: string;
  description?: string;
  status?: ScriptStatus;
  hook?: string;
  tags?: string[];
  characters?: string[];
}): Promise<ActionResult<Script>> {
  try {
    const validation = validateScriptInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const created = await createScriptRecord(data);
    revalidatePath("/scripts");
    revalidatePath("/dashboard");
    return successResult(created);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to persist screenplay.";
    return errorResult(message);
  }
}

export async function updateScriptAction(
  id: string,
  data: Partial<Omit<Script, "id" | "createdAt" | "scenes">>
): Promise<ActionResult<Script>> {
  try {
    const validation = validateScriptInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const updated = await updateScriptRecord(id, data);
    revalidatePath("/scripts");
    revalidatePath("/dashboard");
    return successResult(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update screenplay.";
    return errorResult(message);
  }
}

export async function deleteScriptAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const ok = await deleteScriptRecord(id);
    if (!ok) {
      return errorResult("Script not found or could not be removed.");
    }
    revalidatePath("/scripts");
    revalidatePath("/dashboard");
    return successResult({ id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete screenplay.";
    return errorResult(message);
  }
}

// Scene Actions
export async function createSceneAction(
  scriptId: string,
  data: {
    title: string;
    description?: string;
    duration?: number;
    notes?: string;
    characters?: string[];
  }
): Promise<ActionResult<Scene>> {
  try {
    const validation = validateSceneInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const scene = await createSceneRecord(scriptId, data);
    revalidatePath("/scripts");
    return successResult(scene);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add scene.";
    return errorResult(message);
  }
}

export async function updateSceneAction(
  sceneId: string,
  data: Partial<Omit<Scene, "id" | "dialogue">>
): Promise<ActionResult<Scene>> {
  try {
    const validation = validateSceneInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const updated = await updateSceneRecord(sceneId, data);
    revalidatePath("/scripts");
    return successResult(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update scene.";
    return errorResult(message);
  }
}

export async function deleteSceneAction(sceneId: string): Promise<ActionResult<{ id: string }>> {
  try {
    const ok = await deleteSceneRecord(sceneId);
    if (!ok) {
      return errorResult("Scene not found or could not be removed.");
    }
    revalidatePath("/scripts");
    return successResult({ id: sceneId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete scene.";
    return errorResult(message);
  }
}

export async function reorderScenesAction(
  scriptId: string,
  sceneIdsInOrder: string[]
): Promise<ActionResult<{ success: boolean }>> {
  try {
    await reorderScenesRecord(scriptId, sceneIdsInOrder);
    revalidatePath("/scripts");
    return successResult({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reorder scenes.";
    return errorResult(message);
  }
}

// Dialogue Actions
export async function createDialogueLineAction(
  sceneId: string,
  data: {
    characterId: string;
    text: string;
    emotion?: DialogueEmotion;
    duration?: number;
  }
): Promise<ActionResult<DialogueLine>> {
  try {
    const validation = validateDialogueInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const line = await createDialogueLineRecord(sceneId, data);
    revalidatePath("/scripts");
    return successResult(line);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add dialogue line.";
    return errorResult(message);
  }
}

export async function updateDialogueLineAction(
  lineId: string,
  data: Partial<Omit<DialogueLine, "id">>
): Promise<ActionResult<DialogueLine>> {
  try {
    const validation = validateDialogueInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const updated = await updateDialogueLineRecord(lineId, data);
    revalidatePath("/scripts");
    return successResult(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update dialogue line.";
    return errorResult(message);
  }
}

export async function deleteDialogueLineAction(lineId: string): Promise<ActionResult<{ id: string }>> {
  try {
    const ok = await deleteDialogueLineRecord(lineId);
    if (!ok) {
      return errorResult("Dialogue line not found.");
    }
    revalidatePath("/scripts");
    return successResult({ id: lineId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete dialogue line.";
    return errorResult(message);
  }
}
