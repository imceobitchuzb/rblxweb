import {
  Character,
  CharacterRole,
  DialogueEmotion,
  DialogueLine,
  Scene,
  Script,
  ScriptStatus,
} from "./types";
import { ALL_ROLES, SCRIPT_STATUS_PROGRESSION } from "./constants";

export interface CharacterFilterOptions {
  search?: string;
  role?: string;
  tag?: string;
}

export interface ScriptFilterOptions {
  search?: string;
  status?: string;
}

/**
 * Filter characters by search query (name, description, personality, tags), role, and tag.
 */
export function filterCharacters(
  characters: Character[],
  options: CharacterFilterOptions
): Character[] {
  const searchTerm = options.search?.trim().toLowerCase() || "";
  const roleFilter = options.role && options.role !== "ALL" ? options.role : null;
  const tagFilter = options.tag && options.tag !== "ALL" ? options.tag.toLowerCase() : null;

  return characters.filter((char) => {
    // 1. Search filter: check name, description, personality, and tags
    if (searchTerm) {
      const matchName = char.name.toLowerCase().includes(searchTerm);
      const matchDesc = char.description.toLowerCase().includes(searchTerm);
      const matchPers = char.personality.toLowerCase().includes(searchTerm);
      const matchOutfit = char.outfit?.toLowerCase().includes(searchTerm) || false;
      const matchTags = char.tags.some((t) => t.toLowerCase().includes(searchTerm));

      if (!matchName && !matchDesc && !matchPers && !matchOutfit && !matchTags) {
        return false;
      }
    }

    // 2. Role filter
    if (roleFilter && char.role !== roleFilter) {
      return false;
    }

    // 3. Tag filter
    if (tagFilter && !char.tags.some((t) => t.toLowerCase() === tagFilter)) {
      return false;
    }

    return true;
  });
}

/**
 * Validate character creation/edit form.
 */
export function validateCharacterForm(data: {
  name: string;
  role: string;
  description: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.name || !data.name.trim()) {
    errors.name = "Character name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Character name must be at least 2 characters";
  }

  if (!data.description || !data.description.trim()) {
    errors.description = "Character description is required";
  }

  if (!ALL_ROLES.includes(data.role as CharacterRole)) {
    errors.role = "Please select a valid role";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Find all scripts that reference a specific character ID in dialogue lines or scene cast.
 */
export function getScriptsUsingCharacter(
  characterId: string,
  scripts: Script[]
): Script[] {
  return scripts.filter((script) => {
    // Check script-level cast list
    if (script.characters?.includes(characterId)) return true;

    // Check individual scene cast or dialogue lines
    return script.scenes.some(
      (scene) =>
        scene.characters?.includes(characterId) ||
        scene.dialogue.some((d) => d.characterId === characterId)
    );
  });
}

/**
 * Filter scripts by search query (title, hook, description, tags) and status.
 */
export function filterScripts(
  scripts: Script[],
  options: ScriptFilterOptions
): Script[] {
  const searchTerm = options.search?.trim().toLowerCase() || "";
  const statusFilter = options.status && options.status !== "ALL" ? options.status : null;

  return scripts.filter((script) => {
    if (searchTerm) {
      const matchTitle = script.title.toLowerCase().includes(searchTerm);
      const matchHook = script.hook?.toLowerCase().includes(searchTerm) || false;
      const matchDesc = script.description?.toLowerCase().includes(searchTerm) || false;
      const matchTags = script.tags?.some((t) => t.toLowerCase().includes(searchTerm)) || false;

      if (!matchTitle && !matchHook && !matchDesc && !matchTags) {
        return false;
      }
    }

    if (statusFilter && script.status !== statusFilter) {
      return false;
    }

    return true;
  });
}

/**
 * Calculate total estimated runtime and breakdown metrics for a script.
 * Returns duration in seconds and formatted time string (e.g. 00:42.5 or 01:25.0).
 */
export function calculateScriptRuntime(scenes: Scene[]): {
  totalDuration: number;
  formatted: string;
  sceneCount: number;
  dialogueCount: number;
  uniqueCharacters: string[];
} {
  let dialogueCount = 0;
  const characterSet = new Set<string>();

  let totalDuration = 0;

  for (const scene of scenes) {
    let sceneDialogueDuration = 0;
    for (const d of scene.dialogue) {
      dialogueCount++;
      if (d.characterId) characterSet.add(d.characterId);
      sceneDialogueDuration += Number(d.duration) || 0;
    }

    // Use scene duration or dialogue sum (whichever is greater/specified)
    const effectiveSceneDuration =
      Number(scene.duration) > 0 ? Number(scene.duration) : sceneDialogueDuration;

    totalDuration += effectiveSceneDuration;
  }

  // Format mm:ss.s
  const minutes = Math.floor(totalDuration / 60);
  const remainingSeconds = (totalDuration % 60).toFixed(1);
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.padStart(4, "0");
  const formatted = `${formattedMinutes}:${formattedSeconds}`;

  return {
    totalDuration,
    formatted,
    sceneCount: scenes.length,
    dialogueCount,
    uniqueCharacters: Array.from(characterSet),
  };
}

/**
 * Linear status progression for scripts.
 */
export function getNextScriptStatus(currentStatus: ScriptStatus): ScriptStatus | null {
  const currentIndex = SCRIPT_STATUS_PROGRESSION.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex >= SCRIPT_STATUS_PROGRESSION.length - 1) {
    return null;
  }
  return SCRIPT_STATUS_PROGRESSION[currentIndex + 1];
}

/**
 * Resolve character object from character ID.
 */
export function resolveCharacter(
  characterId: string,
  characters: Character[]
): Character | undefined {
  return characters.find((c) => c.id === characterId);
}

/**
 * Resolve character display name with fallback.
 */
export function resolveCharacterName(
  characterId: string,
  characters: Character[]
): string {
  const char = resolveCharacter(characterId, characters);
  return char ? char.name : "Unknown Character";
}

/**
 * Factory to create a new Script from an existing Idea without duplicating objects.
 */
export function createScriptFromIdea(idea: {
  id: string;
  title: string;
  description: string;
  tags: string[];
}): Script {
  const timestamp = new Date().toISOString();
  return {
    id: `script-${Date.now()}`,
    ideaId: idea.id,
    title: idea.title,
    description: idea.description,
    status: "SCRIPTING",
    hook: `Hook for ${idea.title}...`,
    scenes: [
      {
        id: `scene-${Date.now()}-1`,
        title: "Scene 1: Introduction",
        description: "Set up the initial concept hook and scenario.",
        duration: 15,
        dialogue: [],
        characters: [],
        notes: "Introductory sequence.",
      },
    ],
    characters: [],
    tags: [...idea.tags],
    estimatedDuration: 15,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
