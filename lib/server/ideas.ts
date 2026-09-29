import { prisma } from "../prisma";
import { IdeaItem, IdeaStatus } from "../types";
import { getCurrentUserId } from "./user-context";
import { memoryStore } from "./store";

function mapPrismaIdeaToItem(idea: {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  tags: string[];
  potentialScore: number;
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
    createdAt: idea.createdAt.toISOString(),
    updatedAt: idea.updatedAt.toISOString(),
  };
}

export async function getIdeas(userId?: string): Promise<IdeaItem[]> {
  const activeUserId = userId || (await getCurrentUserId());

  try {
    const ideas = await prisma.idea.findMany({
      where: { userId: activeUserId },
      orderBy: { createdAt: "desc" },
    });
    return ideas.map(mapPrismaIdeaToItem);
  } catch {
    // Fallback to memory store if PostgreSQL connection is unavailable
    return memoryStore.ideas;
  }
}

export async function getIdeaById(
  id: string,
  userId?: string
): Promise<IdeaItem | null> {
  const activeUserId = userId || (await getCurrentUserId());

  try {
    const idea = await prisma.idea.findFirst({
      where: { id, userId: activeUserId },
    });
    return idea ? mapPrismaIdeaToItem(idea) : null;
  } catch {
    return memoryStore.ideas.find((i) => i.id === id) || null;
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
  userId?: string
): Promise<IdeaItem> {
  const activeUserId = userId || (await getCurrentUserId());

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
  } catch {
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
  userId?: string
): Promise<IdeaItem> {
  const activeUserId = userId || (await getCurrentUserId());

  try {
    const updated = await prisma.idea.update({
      where: { id, userId: activeUserId },
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
    const idx = memoryStore.ideas.findIndex((i) => i.id === id);
    if (idx !== -1) memoryStore.ideas[idx] = mapped;
    return mapped;
  } catch {
    const idx = memoryStore.ideas.findIndex((i) => i.id === id);
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
  userId?: string
): Promise<boolean> {
  const activeUserId = userId || (await getCurrentUserId());

  try {
    await prisma.idea.delete({
      where: { id, userId: activeUserId },
    });
    memoryStore.ideas = memoryStore.ideas.filter((i) => i.id !== id);
    return true;
  } catch {
    const initialLen = memoryStore.ideas.length;
    memoryStore.ideas = memoryStore.ideas.filter((i) => i.id !== id);
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
  userId?: string
): Promise<IdeaItem> {
  const idea = await getIdeaById(id, userId);
  if (!idea) throw new Error(`Idea not found: ${id}`);

  const nextStatus = STATUS_PROGRESSION[idea.status];
  if (!nextStatus) return idea;

  return updateIdeaRecord(id, { status: nextStatus }, userId);
}
