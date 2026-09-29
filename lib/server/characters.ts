import { prisma } from "../prisma";
import { Character, CharacterRole } from "../types";
import { getCurrentUserId } from "./user-context";
import { memoryStore } from "./store";

function mapPrismaCharacterToItem(char: {
  id: string;
  name: string;
  role: string;
  description: string;
  personality: string;
  outfit: string;
  avatar: string | null;
  avatarUrl: string | null;
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}): Character {
  const avatarValue =
    char.avatar ||
    char.avatarUrl ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200";

  return {
    id: char.id,
    name: char.name,
    role: char.role as CharacterRole,
    description: char.description,
    personality: char.personality,
    outfit: char.outfit,
    avatar: avatarValue,
    avatarUrl: avatarValue,
    notes: char.notes,
    tags: char.tags,
    createdAt: char.createdAt.toISOString(),
    updatedAt: char.updatedAt.toISOString(),
  };
}

export async function getCharacters(userId?: string): Promise<Character[]> {
  const activeUserId = userId || (await getCurrentUserId());

  try {
    const chars = await prisma.character.findMany({
      where: { userId: activeUserId },
      orderBy: { createdAt: "asc" },
    });
    return chars.map(mapPrismaCharacterToItem);
  } catch {
    return memoryStore.characters;
  }
}

export async function getCharacterById(
  id: string,
  userId?: string
): Promise<Character | null> {
  const activeUserId = userId || (await getCurrentUserId());

  try {
    const char = await prisma.character.findFirst({
      where: { id, userId: activeUserId },
    });
    return char ? mapPrismaCharacterToItem(char) : null;
  } catch {
    return memoryStore.characters.find((c) => c.id === id) || null;
  }
}

export async function createCharacterRecord(
  data: {
    name: string;
    role?: CharacterRole;
    description?: string;
    personality?: string;
    outfit?: string;
    avatar?: string;
    notes?: string;
    tags?: string[];
  },
  userId?: string
): Promise<Character> {
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

    const created = await prisma.character.create({
      data: {
        userId: activeUserId,
        name: data.name,
        role: (data.role || "MAIN") as never,
        description: data.description || "",
        personality: data.personality || "",
        outfit: data.outfit || "",
        avatar: data.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
        avatarUrl: data.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
        notes: data.notes || "",
        tags: data.tags || [],
      },
    });
    const mapped = mapPrismaCharacterToItem(created);
    memoryStore.characters.push(mapped);
    return mapped;
  } catch {
    const now = new Date().toISOString();
    const fallback: Character = {
      id: `char-${Date.now()}`,
      name: data.name,
      role: data.role || "MAIN",
      description: data.description || "",
      personality: data.personality || "",
      outfit: data.outfit || "",
      avatar: data.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
      avatarUrl: data.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
      notes: data.notes || "",
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.characters.push(fallback);
    return fallback;
  }
}

export async function updateCharacterRecord(
  id: string,
  data: Partial<Omit<Character, "id" | "createdAt">>,
  userId?: string
): Promise<Character> {
  const activeUserId = userId || (await getCurrentUserId());

  try {
    const updated = await prisma.character.update({
      where: { id, userId: activeUserId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.role !== undefined ? { role: data.role as never } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.personality !== undefined ? { personality: data.personality } : {}),
        ...(data.outfit !== undefined ? { outfit: data.outfit } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar, avatarUrl: data.avatar } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
      },
    });
    const mapped = mapPrismaCharacterToItem(updated);
    const idx = memoryStore.characters.findIndex((c) => c.id === id);
    if (idx !== -1) memoryStore.characters[idx] = mapped;
    return mapped;
  } catch {
    const idx = memoryStore.characters.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Character not found: ${id}`);
    const updated: Character = {
      ...memoryStore.characters[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    memoryStore.characters[idx] = updated;
    return updated;
  }
}

export async function checkCharacterScriptReferences(
  characterId: string,
  userId?: string
): Promise<string[]> {
  const activeUserId = userId || (await getCurrentUserId());

  try {
    const usages = await prisma.scriptCharacter.findMany({
      where: {
        characterId,
        script: { userId: activeUserId },
      },
      include: {
        script: { select: { title: true } },
      },
    });
    return usages.map((u) => u.script.title);
  } catch {
    const referenced = memoryStore.scripts
      .filter((s) => s.characters.includes(characterId))
      .map((s) => s.title);
    return referenced;
  }
}

export async function deleteCharacterRecord(
  id: string,
  userId?: string
): Promise<boolean> {
  const activeUserId = userId || (await getCurrentUserId());

  // 1. Dependency protection: check if character is referenced in scripts
  const referencingScripts = await checkCharacterScriptReferences(id, activeUserId);
  if (referencingScripts.length > 0) {
    throw new Error(
      `Cannot delete character: referenced in ${referencingScripts.length} screenplay(s) (${referencingScripts.slice(0, 2).join(", ")}${referencingScripts.length > 2 ? "..." : ""}). Remove character from scripts before deleting.`
    );
  }

  try {
    await prisma.character.delete({
      where: { id, userId: activeUserId },
    });
    memoryStore.characters = memoryStore.characters.filter((c) => c.id !== id);
    return true;
  } catch {
    const initialLen = memoryStore.characters.length;
    memoryStore.characters = memoryStore.characters.filter((c) => c.id !== id);
    return memoryStore.characters.length < initialLen;
  }
}
