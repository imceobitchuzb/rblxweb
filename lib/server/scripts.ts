import { prisma } from "../prisma";
import { DialogueEmotion, DialogueLine, Scene, Script, ScriptStatus } from "../types";
import { getCurrentUserId, getCurrentWorkspaceId } from "./user-context";
import { memoryStore, assertPersistentDatabase } from "./store";

function mapPrismaScriptToItem(script: {
  id: string;
  ideaId: string | null;
  title: string;
  description: string;
  status: string;
  hook: string;
  tags: string[];
  estimatedDuration: number;
  workspaceId?: string | null;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  characters: { characterId: string }[];
  scenes: {
    id: string;
    scriptId: string;
    orderIndex: number;
    title: string;
    description: string;
    duration: number;
    notes: string;
    characters: string[];
    dialogue: {
      id: string;
      characterId: string;
      text: string;
      emotion: string;
      duration: number;
      orderIndex: number;
    }[];
  }[];
}): Script {
  return {
    id: script.id,
    ideaId: script.ideaId || undefined,
    title: script.title,
    description: script.description,
    status: script.status as ScriptStatus,
    hook: script.hook,
    tags: script.tags,
    estimatedDuration: script.estimatedDuration,
    workspaceId: script.workspaceId || undefined,
    userId: script.userId,
    createdAt: script.createdAt.toISOString(),
    updatedAt: script.updatedAt.toISOString(),
    characters: script.characters.map((c) => c.characterId),
    scenes: script.scenes.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      duration: s.duration,
      notes: s.notes,
      characters: s.characters,
      dialogue: s.dialogue
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((d) => ({
          id: d.id,
          characterId: d.characterId,
          text: d.text,
          emotion: d.emotion as DialogueEmotion,
          duration: d.duration,
        })),
    })),
  };
}

export async function getScripts(userId?: string, workspaceId?: string): Promise<Script[]> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

  try {
    const scripts = await prisma.script.findMany({
      where: {
        OR: [
          { workspaceId: activeWorkspaceId },
          { workspaceId: null, userId: activeUserId },
        ],
      },
      include: {
        characters: true,
        scenes: {
          include: {
            dialogue: {
              orderBy: { orderIndex: "asc" },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return scripts.map(mapPrismaScriptToItem);
  } catch (err) {
    assertPersistentDatabase("getScripts", err);
    return memoryStore.scripts.filter((s) =>
      s.workspaceId ? s.workspaceId === activeWorkspaceId : s.userId === activeUserId
    );
  }
}

export async function getScriptById(
  id: string,
  userId?: string,
  workspaceId?: string
): Promise<Script | null> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

  try {
    const script = await prisma.script.findFirst({
      where: {
        id,
        OR: [
          { workspaceId: activeWorkspaceId },
          { workspaceId: null, userId: activeUserId },
        ],
      },
      include: {
        characters: true,
        scenes: {
          include: {
            dialogue: {
              orderBy: { orderIndex: "asc" },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });
    return script ? mapPrismaScriptToItem(script) : null;
  } catch (err) {
    assertPersistentDatabase("getScriptById", err);
    return (
      memoryStore.scripts.find(
        (s) =>
          s.id === id &&
          (s.workspaceId ? s.workspaceId === activeWorkspaceId : s.userId === activeUserId)
      ) || null
    );
  }
}

export async function createScriptRecord(
  data: {
    ideaId?: string;
    title: string;
    description?: string;
    status?: ScriptStatus;
    hook?: string;
    tags?: string[];
    characters?: string[];
  },
  userId?: string,
  workspaceId?: string
): Promise<Script> {
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

    const created = await prisma.script.create({
      data: {
        userId: activeUserId,
        workspaceId: activeWorkspaceId,
        ideaId: data.ideaId || null,
        title: data.title,
        description: data.description || "",
        status: (data.status || "DRAFT") as never,
        hook: data.hook || "",
        tags: data.tags || [],
        estimatedDuration: 0,
        characters: {
          create: (data.characters || []).map((cid) => ({
            character: { connect: { id: cid } },
          })),
        },
      },
      include: {
        characters: true,
        scenes: {
          include: { dialogue: true },
        },
      },
    });
    const mapped = mapPrismaScriptToItem(created);
    memoryStore.scripts.unshift(mapped);
    return mapped;
  } catch (err) {
    assertPersistentDatabase("createScriptRecord", err);
    const now = new Date().toISOString();
    const fallback: Script = {
      id: `script-${Date.now()}`,
      ideaId: data.ideaId,
      title: data.title,
      description: data.description || "",
      status: data.status || "DRAFT",
      hook: data.hook || "",
      tags: data.tags || [],
      estimatedDuration: 0,
      characters: data.characters || [],
      scenes: [],
      workspaceId: activeWorkspaceId,
      userId: activeUserId,
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.scripts.unshift(fallback);
    return fallback;
  }
}

export async function updateScriptRecord(
  id: string,
  data: Partial<Omit<Script, "id" | "createdAt" | "scenes">>,
  userId?: string,
  workspaceId?: string
): Promise<Script> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

  try {
    const existing = await prisma.script.findFirst({
      where: {
        id,
        OR: [
          { workspaceId: activeWorkspaceId },
          { workspaceId: null, userId: activeUserId },
        ],
      },
    });
    if (!existing) {
      throw new Error(`Script not found: ${id}`);
    }

    const updated = await prisma.script.update({
      where: { id: existing.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.status !== undefined ? { status: data.status as never } : {}),
        ...(data.hook !== undefined ? { hook: data.hook } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        ...(data.estimatedDuration !== undefined ? { estimatedDuration: data.estimatedDuration } : {}),
      },
      include: {
        characters: true,
        scenes: {
          include: {
            dialogue: { orderBy: { orderIndex: "asc" } },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });
    const mapped = mapPrismaScriptToItem(updated);
    const idx = memoryStore.scripts.findIndex(
      (s) =>
        s.id === id &&
        (s.workspaceId ? s.workspaceId === activeWorkspaceId : s.userId === activeUserId)
    );
    if (idx !== -1) memoryStore.scripts[idx] = mapped;
    return mapped;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Script not found")) {
      throw err;
    }
    assertPersistentDatabase("updateScriptRecord", err);
    const idx = memoryStore.scripts.findIndex(
      (s) =>
        s.id === id &&
        (s.workspaceId ? s.workspaceId === activeWorkspaceId : s.userId === activeUserId)
    );
    if (idx === -1) throw new Error(`Script not found: ${id}`);
    const updated: Script = {
      ...memoryStore.scripts[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    memoryStore.scripts[idx] = updated;
    return updated;
  }
}

export async function deleteScriptRecord(
  id: string,
  userId?: string,
  workspaceId?: string
): Promise<boolean> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

  try {
    const existing = await prisma.script.findFirst({
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

    await prisma.script.delete({
      where: { id: existing.id },
    });
    memoryStore.scripts = memoryStore.scripts.filter(
      (s) =>
        !(s.id === id && (s.workspaceId ? s.workspaceId === activeWorkspaceId : s.userId === activeUserId))
    );
    return true;
  } catch (err) {
    assertPersistentDatabase("deleteScriptRecord", err);
    const initialLen = memoryStore.scripts.length;
    memoryStore.scripts = memoryStore.scripts.filter(
      (s) =>
        !(s.id === id && (s.workspaceId ? s.workspaceId === activeWorkspaceId : s.userId === activeUserId))
    );
    return memoryStore.scripts.length < initialLen;
  }
}

// Scene CRUD Operations
export async function createSceneRecord(
  scriptId: string,
  data: {
    title: string;
    description?: string;
    duration?: number;
    notes?: string;
    characters?: string[];
  }
): Promise<Scene> {
  try {
    const existingCount = await prisma.scene.count({ where: { scriptId } });
    const created = await prisma.scene.create({
      data: {
        scriptId,
        orderIndex: existingCount,
        title: data.title,
        description: data.description || "",
        duration: data.duration || 0,
        notes: data.notes || "",
        characters: data.characters || [],
      },
    });
    const scene: Scene = {
      id: created.id,
      title: created.title,
      description: created.description,
      duration: created.duration,
      notes: created.notes,
      characters: created.characters,
      dialogue: [],
    };
    const script = memoryStore.scripts.find((s) => s.id === scriptId);
    if (script) script.scenes.push(scene);
    return scene;
  } catch {
    const scene: Scene = {
      id: `scene-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      duration: data.duration || 0,
      notes: data.notes || "",
      characters: data.characters || [],
      dialogue: [],
    };
    const script = memoryStore.scripts.find((s) => s.id === scriptId);
    if (script) script.scenes.push(scene);
    return scene;
  }
}

export async function updateSceneRecord(
  sceneId: string,
  data: Partial<Omit<Scene, "id" | "dialogue">>
): Promise<Scene> {
  try {
    const updated = await prisma.scene.update({
      where: { id: sceneId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.duration !== undefined ? { duration: data.duration } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.characters !== undefined ? { characters: data.characters } : {}),
      },
      include: {
        dialogue: { orderBy: { orderIndex: "asc" } },
      },
    });
    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      duration: updated.duration,
      notes: updated.notes,
      characters: updated.characters,
      dialogue: updated.dialogue.map((d) => ({
        id: d.id,
        characterId: d.characterId,
        text: d.text,
        emotion: d.emotion as DialogueEmotion,
        duration: d.duration,
      })),
    };
  } catch {
    for (const script of memoryStore.scripts) {
      const idx = script.scenes.findIndex((s) => s.id === sceneId);
      if (idx !== -1) {
        script.scenes[idx] = { ...script.scenes[idx], ...data };
        return script.scenes[idx];
      }
    }
    throw new Error(`Scene not found: ${sceneId}`);
  }
}

export async function deleteSceneRecord(sceneId: string): Promise<boolean> {
  try {
    await prisma.scene.delete({ where: { id: sceneId } });
    for (const script of memoryStore.scripts) {
      script.scenes = script.scenes.filter((s) => s.id !== sceneId);
    }
    return true;
  } catch {
    for (const script of memoryStore.scripts) {
      script.scenes = script.scenes.filter((s) => s.id !== sceneId);
    }
    return true;
  }
}

export async function reorderScenesRecord(
  scriptId: string,
  sceneIdsInOrder: string[]
): Promise<boolean> {
  try {
    await prisma.$transaction(
      sceneIdsInOrder.map((id, index) =>
        prisma.scene.update({
          where: { id },
          data: { orderIndex: index },
        })
      )
    );
    return true;
  } catch {
    const script = memoryStore.scripts.find((s) => s.id === scriptId);
    if (script) {
      script.scenes.sort(
        (a, b) => sceneIdsInOrder.indexOf(a.id) - sceneIdsInOrder.indexOf(b.id)
      );
    }
    return true;
  }
}

// Dialogue Line CRUD Operations
export async function createDialogueLineRecord(
  sceneId: string,
  data: {
    characterId: string;
    text: string;
    emotion?: DialogueEmotion;
    duration?: number;
  }
): Promise<DialogueLine> {
  try {
    const existingCount = await prisma.dialogueLine.count({ where: { sceneId } });
    const created = await prisma.dialogueLine.create({
      data: {
        sceneId,
        characterId: data.characterId,
        text: data.text,
        emotion: (data.emotion || "NEUTRAL") as never,
        duration: data.duration || 3.0,
        orderIndex: existingCount,
      },
    });
    const line: DialogueLine = {
      id: created.id,
      characterId: created.characterId,
      text: created.text,
      emotion: created.emotion as DialogueEmotion,
      duration: created.duration,
    };
    for (const script of memoryStore.scripts) {
      const scene = script.scenes.find((s) => s.id === sceneId);
      if (scene) scene.dialogue.push(line);
    }
    return line;
  } catch {
    const line: DialogueLine = {
      id: `d-${Date.now()}`,
      characterId: data.characterId,
      text: data.text,
      emotion: data.emotion || "NEUTRAL",
      duration: data.duration || 3.0,
    };
    for (const script of memoryStore.scripts) {
      const scene = script.scenes.find((s) => s.id === sceneId);
      if (scene) scene.dialogue.push(line);
    }
    return line;
  }
}

export async function updateDialogueLineRecord(
  lineId: string,
  data: Partial<Omit<DialogueLine, "id">>
): Promise<DialogueLine> {
  try {
    const updated = await prisma.dialogueLine.update({
      where: { id: lineId },
      data: {
        ...(data.characterId !== undefined ? { characterId: data.characterId } : {}),
        ...(data.text !== undefined ? { text: data.text } : {}),
        ...(data.emotion !== undefined ? { emotion: data.emotion as never } : {}),
        ...(data.duration !== undefined ? { duration: data.duration } : {}),
      },
    });
    return {
      id: updated.id,
      characterId: updated.characterId,
      text: updated.text,
      emotion: updated.emotion as DialogueEmotion,
      duration: updated.duration,
    };
  } catch {
    for (const script of memoryStore.scripts) {
      for (const scene of script.scenes) {
        const idx = scene.dialogue.findIndex((d) => d.id === lineId);
        if (idx !== -1) {
          scene.dialogue[idx] = { ...scene.dialogue[idx], ...data };
          return scene.dialogue[idx];
        }
      }
    }
    throw new Error(`Dialogue line not found: ${lineId}`);
  }
}

export async function deleteDialogueLineRecord(lineId: string): Promise<boolean> {
  try {
    await prisma.dialogueLine.delete({ where: { id: lineId } });
    for (const script of memoryStore.scripts) {
      for (const scene of script.scenes) {
        scene.dialogue = scene.dialogue.filter((d) => d.id !== lineId);
      }
    }
    return true;
  } catch {
    for (const script of memoryStore.scripts) {
      for (const scene of script.scenes) {
        scene.dialogue = scene.dialogue.filter((d) => d.id !== lineId);
      }
    }
    return true;
  }
}
