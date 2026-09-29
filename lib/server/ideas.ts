import { prisma } from "../prisma";
import { IdeaItem, IdeaStatus } from "../types";
import { getCurrentUserId, getCurrentWorkspaceId } from "./user-context";
import { memoryStore, assertPersistentDatabase } from "./store";

function mapPrismaIdeaToItem(idea: {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  tags: string[];
  potentialScore: number;
  workspaceId?: string | null;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}): IdeaItem {
  return {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    category: idea.category as IdeaItem["category"],
    status: idea.status as IdeaItem["status"],
    priority: idea.priority as IdeaItem["priority"],
    tags: idea.tags,
    potentialScore: idea.potentialScore,
    workspaceId: idea.workspaceId || undefined,
    userId: idea.userId,
    createdAt: idea.createdAt.toISOString(),
    updatedAt: idea.updatedAt.toISOString(),
  };
}

export async function getIdeas(userId?: string, workspaceId?: string): Promise<IdeaItem[]> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

  try {
    const ideas = await prisma.idea.findMany({
      where: {
        OR: [
          { workspaceId: activeWorkspaceId },
          { workspaceId: null, userId: activeUserId },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
    return ideas.map(mapPrismaIdeaToItem);
  } catch (err) {
    assertPersistentDatabase("getIdeas", err);
    // Fallback to memory store scoped to active workspace
    return memoryStore.ideas.filter((i) =>
      i.workspaceId ? i.workspaceId === activeWorkspaceId : i.userId === activeUserId
    );
  }
}

export async function getIdeaById(
  id: string,
  userId?: string,
  workspaceId?: string
): Promise<IdeaItem | null> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

  try {
    const idea = await prisma.idea.findFirst({
      where: {
        id,
        OR: [
          { workspaceId: activeWorkspaceId },
          { workspaceId: null, userId: activeUserId },
        ],
      },
    });
    return idea ? mapPrismaIdeaToItem(idea) : null;
  } catch (err) {
    assertPersistentDatabase("getIdeaById", err);
    return (
      memoryStore.ideas.find(
        (i) =>
          i.id === id &&
          (i.workspaceId ? i.workspaceId === activeWorkspaceId : i.userId === activeUserId)
      ) || null
    );
  }
}

export async function createIdeaRecord(
  data: {
    title: string;
    description?: string;
    category?: IdeaItem["category"];
    status?: IdeaItem["status"];
    priority?: IdeaItem["priority"];
    tags?: string[];
    potentialScore?: number;
  },
  userId?: string,
  workspaceId?: string
): Promise<IdeaItem> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

  try {
    // Ensure User exists before inserting idea
    await prisma.user.upsert({
      where: { id: activeUserId },
      update: {},
      create: {
        id: activeUserId,
        email: "creator@roxiehub.gg",
        name: "Roxie Velocity",
      },
    });

    const created = await prisma.idea.create({
      data: {
        userId: activeUserId,
        workspaceId: activeWorkspaceId,
        title: data.title,
        description: data.description || "",
        category: (data.category || "OTHER") as never,
        status: (data.status || "IDEA") as never,
        priority: (data.priority || "MEDIUM") as never,
        tags: data.tags || [],
        potentialScore: data.potentialScore ?? 5,
      },
    });
    const mapped = mapPrismaIdeaToItem(created);
    memoryStore.ideas.unshift(mapped);
    return mapped;
  } catch (err) {
    assertPersistentDatabase("createIdeaRecord", err);
    const now = new Date().toISOString();
    const fallback: IdeaItem = {
      id: `idea-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      category: data.category || "OTHER",
      status: data.status || "IDEA",
      priority: data.priority || "MEDIUM",
      tags: data.tags || [],
      potentialScore: data.potentialScore ?? 5,
      workspaceId: activeWorkspaceId,
      userId: activeUserId,
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.ideas.unshift(fallback);
    return fallback;
  }
}

export async function updateIdeaRecord(
  id: string,
  data: Partial<Omit<IdeaItem, "id" | "createdAt">>,
  userId?: string,
  workspaceId?: string
): Promise<IdeaItem> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

  try {
    const existing = await prisma.idea.findFirst({
      where: {
        id,
        OR: [
          { workspaceId: activeWorkspaceId },
          { workspaceId: null, userId: activeUserId },
        ],
      },
    });
    if (!existing) {
      throw new Error(`Idea not found: ${id}`);
    }

    const updated = await prisma.idea.update({
      where: { id: existing.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.category !== undefined ? { category: data.category as never } : {}),
        ...(data.status !== undefined ? { status: data.status as never } : {}),
        ...(data.priority !== undefined ? { priority: data.priority as never } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        ...(data.potentialScore !== undefined ? { potentialScore: data.potentialScore } : {}),
      },
    });
    const mapped = mapPrismaIdeaToItem(updated);
    const idx = memoryStore.ideas.findIndex(
      (i) =>
        i.id === id &&
        (i.workspaceId ? i.workspaceId === activeWorkspaceId : i.userId === activeUserId)
    );
    if (idx !== -1) memoryStore.ideas[idx] = mapped;
    return mapped;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Idea not found")) {
      throw err;
    }
    assertPersistentDatabase("updateIdeaRecord", err);
    const idx = memoryStore.ideas.findIndex(
      (i) =>
        i.id === id &&
        (i.workspaceId ? i.workspaceId === activeWorkspaceId : i.userId === activeUserId)
    );
    if (idx === -1) {
      throw new Error(`Idea not found: ${id}`);
    }
    const updated: IdeaItem = {
      ...memoryStore.ideas[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    memoryStore.ideas[idx] = updated;
    return updated;
  }
}

export async function deleteIdeaRecord(
  id: string,
  userId?: string,
  workspaceId?: string
): Promise<boolean> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

  try {
    const existing = await prisma.idea.findFirst({
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

    await prisma.idea.delete({
      where: { id: existing.id },
    });
    memoryStore.ideas = memoryStore.ideas.filter(
      (i) =>
        !(i.id === id && (i.workspaceId ? i.workspaceId === activeWorkspaceId : i.userId === activeUserId))
    );
    return true;
  } catch (err) {
    assertPersistentDatabase("deleteIdeaRecord", err);
    const initialLen = memoryStore.ideas.length;
    memoryStore.ideas = memoryStore.ideas.filter(
      (i) =>
        !(i.id === id && (i.workspaceId ? i.workspaceId === activeWorkspaceId : i.userId === activeUserId))
    );
    return memoryStore.ideas.length < initialLen;
  }
}

const STATUS_PROGRESSION: Record<IdeaStatus, IdeaStatus | null> = {
  IDEA: "PLANNING",
  PLANNING: "SCRIPTING",
  SCRIPTING: "PRODUCTION",
  PRODUCTION: "PUBLISHED",
  PUBLISHED: null,
  ARCHIVED: null,
};

export async function advanceIdeaStatusRecord(
  id: string,
  userId?: string,
  workspaceId?: string
): Promise<IdeaItem> {
  const idea = await getIdeaById(id, userId, workspaceId);
  if (!idea) throw new Error(`Idea not found: ${id}`);

  const nextStatus = STATUS_PROGRESSION[idea.status];
  if (!nextStatus) return idea;

  return updateIdeaRecord(id, { status: nextStatus }, userId, workspaceId);
}
