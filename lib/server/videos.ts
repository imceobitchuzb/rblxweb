import { prisma } from "../prisma";
import { Video, VideoPlatform, VideoStatus } from "../types";
import { getCurrentUserId, getCurrentWorkspaceId } from "./user-context";
import { memoryStore, assertPersistentDatabase } from "./store";

function mapPrismaVideoToItem(video: {
  id: string;
  ideaId: string | null;
  scriptId: string | null;
  title: string;
  description: string;
  thumbnail: string;
  platform: string;
  status: string;
  duration: number;
  views: number;
  likes: number;
  comments: number;
  url: string | null;
  tags: string[];
  workspaceId?: string | null;
  userId?: string;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  characters?: { characterId: string }[];
}): Video {
  return {
    id: video.id,
    ideaId: video.ideaId || undefined,
    scriptId: video.scriptId || undefined,
    title: video.title,
    description: video.description,
    thumbnail: video.thumbnail,
    platform: video.platform as VideoPlatform,
    status: video.status as VideoStatus,
    duration: video.duration,
    views: video.views,
    likes: video.likes,
    comments: video.comments,
    url: video.url || undefined,
    tags: video.tags,
    workspaceId: video.workspaceId || undefined,
    userId: video.userId,
    scheduledAt: video.scheduledAt ? video.scheduledAt.toISOString() : undefined,
    publishedAt: video.publishedAt ? video.publishedAt.toISOString() : undefined,
    createdAt: video.createdAt.toISOString(),
    updatedAt: video.updatedAt.toISOString(),
    characterIds: video.characters ? video.characters.map((c) => c.characterId) : [],
  };
}

export async function getVideos(userId?: string, workspaceId?: string): Promise<Video[]> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

  try {
    const videos = await prisma.video.findMany({
      where: {
        OR: [
          { workspaceId: activeWorkspaceId },
          { workspaceId: null, userId: activeUserId },
        ],
      },
      include: { characters: true },
      orderBy: { createdAt: "desc" },
    });
    return videos.map(mapPrismaVideoToItem);
  } catch (err) {
    assertPersistentDatabase("getVideos", err);
    return memoryStore.videos.filter((v) =>
      v.workspaceId ? v.workspaceId === activeWorkspaceId : v.userId === activeUserId
    );
  }
}

export async function getVideoById(
  id: string,
  userId?: string,
  workspaceId?: string
): Promise<Video | null> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

  try {
    const video = await prisma.video.findFirst({
      where: {
        id,
        OR: [
          { workspaceId: activeWorkspaceId },
          { workspaceId: null, userId: activeUserId },
        ],
      },
      include: { characters: true },
    });
    return video ? mapPrismaVideoToItem(video) : null;
  } catch (err) {
    assertPersistentDatabase("getVideoById", err);
    return (
      memoryStore.videos.find(
        (v) =>
          v.id === id &&
          (v.workspaceId ? v.workspaceId === activeWorkspaceId : v.userId === activeUserId)
      ) || null
    );
  }
}

export async function createVideoRecord(
  data: {
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
  },
  userId?: string,
  workspaceId?: string
): Promise<Video> {
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

    const created = await prisma.video.create({
      data: {
        userId: activeUserId,
        workspaceId: activeWorkspaceId,
        title: data.title,
        description: data.description || "",
        platform: (data.platform || "YOUTUBE") as never,
        status: (data.status || "PLANNING") as never,
        thumbnail: data.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600",
        duration: data.duration || 0,
        scriptId: data.scriptId || null,
        ideaId: data.ideaId || null,
        tags: data.tags || [],
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        url: data.url || null,
        characters: {
          create: (data.characterIds || []).map((cid) => ({
            character: { connect: { id: cid } },
          })),
        },
      },
      include: { characters: true },
    });
    const mapped = mapPrismaVideoToItem(created);
    memoryStore.videos.unshift(mapped);
    return mapped;
  } catch (err) {
    assertPersistentDatabase("createVideoRecord", err);
    const now = new Date().toISOString();
    const fallback: Video = {
      id: `vid-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      platform: data.platform || "YOUTUBE",
      status: data.status || "PLANNING",
      thumbnail: data.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600",
      duration: data.duration || 0,
      scriptId: data.scriptId,
      ideaId: data.ideaId,
      characterIds: data.characterIds || [],
      tags: data.tags || [],
      views: 0,
      likes: 0,
      comments: 0,
      scheduledAt: data.scheduledAt,
      publishedAt: data.publishedAt,
      url: data.url,
      workspaceId: activeWorkspaceId,
      userId: activeUserId,
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.videos.unshift(fallback);
    return fallback;
  }
}

export async function updateVideoRecord(
  id: string,
  data: Partial<Omit<Video, "id" | "createdAt">>,
  userId?: string,
  workspaceId?: string
): Promise<Video> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

  try {
    const existing = await prisma.video.findFirst({
      where: {
        id,
        OR: [
          { workspaceId: activeWorkspaceId },
          { workspaceId: null, userId: activeUserId },
        ],
      },
    });
    if (!existing) {
      throw new Error(`Video not found: ${id}`);
    }

    const updated = await prisma.video.update({
      where: { id: existing.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.platform !== undefined ? { platform: data.platform as never } : {}),
        ...(data.status !== undefined ? { status: data.status as never } : {}),
        ...(data.thumbnail !== undefined ? { thumbnail: data.thumbnail } : {}),
        ...(data.duration !== undefined ? { duration: data.duration } : {}),
        ...(data.views !== undefined ? { views: data.views } : {}),
        ...(data.likes !== undefined ? { likes: data.likes } : {}),
        ...(data.comments !== undefined ? { comments: data.comments } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        ...(data.url !== undefined ? { url: data.url } : {}),
        ...(data.scheduledAt !== undefined
          ? { scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null }
          : {}),
        ...(data.publishedAt !== undefined
          ? { publishedAt: data.publishedAt ? new Date(data.publishedAt) : null }
          : {}),
      },
      include: { characters: true },
    });
    const mapped = mapPrismaVideoToItem(updated);
    const idx = memoryStore.videos.findIndex(
      (v) =>
        v.id === id &&
        (v.workspaceId ? v.workspaceId === activeWorkspaceId : v.userId === activeUserId)
    );
    if (idx !== -1) memoryStore.videos[idx] = mapped;
    return mapped;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Video not found")) {
      throw err;
    }
    assertPersistentDatabase("updateVideoRecord", err);
    const idx = memoryStore.videos.findIndex(
      (v) =>
        v.id === id &&
        (v.workspaceId ? v.workspaceId === activeWorkspaceId : v.userId === activeUserId)
    );
    if (idx === -1) throw new Error(`Video not found: ${id}`);
    const updated: Video = {
      ...memoryStore.videos[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    memoryStore.videos[idx] = updated;
    return updated;
  }
}

export async function deleteVideoRecord(
  id: string,
  userId?: string,
  workspaceId?: string
): Promise<boolean> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

  try {
    const existing = await prisma.video.findFirst({
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

    await prisma.video.delete({
      where: { id: existing.id },
    });
    memoryStore.videos = memoryStore.videos.filter(
      (v) =>
        !(v.id === id && (v.workspaceId ? v.workspaceId === activeWorkspaceId : v.userId === activeUserId))
    );
    return true;
  } catch (err) {
    assertPersistentDatabase("deleteVideoRecord", err);
    const initialLen = memoryStore.videos.length;
    memoryStore.videos = memoryStore.videos.filter(
      (v) =>
        !(v.id === id && (v.workspaceId ? v.workspaceId === activeWorkspaceId : v.userId === activeUserId))
    );
    return memoryStore.videos.length < initialLen;
  }
}

export async function createVideoFromScript(
  scriptId: string,
  data?: {
    platform?: VideoPlatform;
    scheduledAt?: string;
  },
  userId?: string,
  workspaceId?: string
): Promise<Video> {
  const activeUserId = userId || (await getCurrentUserId());
  const activeWorkspaceId = workspaceId || (await getCurrentWorkspaceId());

  const script = await prisma.script
    .findFirst({
      where: {
        id: scriptId,
        OR: [
          { workspaceId: activeWorkspaceId },
          { userId: activeUserId },
        ],
      },
      include: { characters: true, scenes: true },
    })
    .catch(() => null);

  const fallbackScript =
    script ? null : memoryStore.scripts.find((s) => s.id === scriptId);

  const targetTitle = script ? script.title : fallbackScript?.title || "New Video Project";
  const targetDesc = script ? script.description : fallbackScript?.description || "";
  const targetChars = script
    ? script.characters.map((c) => c.characterId)
    : fallbackScript?.characters || [];
  const targetTags = script ? script.tags : fallbackScript?.tags || [];
  const targetDuration = script ? script.estimatedDuration : fallbackScript?.estimatedDuration || 0;

  return createVideoRecord(
    {
      title: targetTitle,
      description: targetDesc,
      scriptId,
      ideaId: script?.ideaId || fallbackScript?.ideaId,
      characterIds: targetChars,
      tags: targetTags,
      duration: targetDuration,
      platform: data?.platform || "YOUTUBE",
      scheduledAt: data?.scheduledAt,
      status: "PLANNING",
    },
    activeUserId,
    activeWorkspaceId
  );
}
