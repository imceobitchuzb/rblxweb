import { prisma } from "../prisma";
import { memoryStore, assertPersistentDatabase } from "./store";

export interface WorkspaceSearchResult {
  id: string;
  type: "idea" | "character" | "script" | "video";
  title: string;
  subtitle: string;
  badge?: string;
  url: string;
}

/**
 * Searches across ideas, characters, scripts, and videos within a single workspace.
 * Guaranteed zero cross-workspace data leakage.
 */
export async function searchWorkspaceEntities(
  workspaceId: string,
  query: string,
  currentUserId: string
): Promise<WorkspaceSearchResult[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // Verify membership
  try {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: currentUserId,
        },
      },
    });
    if (!member) {
      throw new Error("Access denied: You are not a member of this workspace.");
    }

    const [ideas, characters, scripts, videos] = await Promise.all([
      prisma.idea.findMany({
        where: {
          workspaceId,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      prisma.character.findMany({
        where: {
          workspaceId,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      prisma.script.findMany({
        where: {
          workspaceId,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { hook: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      prisma.video.findMany({
        where: {
          workspaceId,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
    ]);

    const results: WorkspaceSearchResult[] = [
      ...ideas.map((i) => ({
        id: i.id,
        type: "idea" as const,
        title: i.title,
        subtitle: i.category || "Idea",
        badge: i.status,
        url: `/ideas?id=${i.id}`,
      })),
      ...characters.map((c) => ({
        id: c.id,
        type: "character" as const,
        title: c.name,
        subtitle: `${c.role} Character`,
        badge: c.role,
        url: `/characters?id=${c.id}`,
      })),
      ...scripts.map((s) => ({
        id: s.id,
        type: "script" as const,
        title: s.title,
        subtitle: s.description || s.hook || "Script",
        badge: s.status,
        url: `/scripts?id=${s.id}`,
      })),
      ...videos.map((v) => ({
        id: v.id,
        type: "video" as const,
        title: v.title,
        subtitle: `${v.platform} Video`,
        badge: v.status,
        url: `/videos?id=${v.id}`,
      })),
    ];

    return results;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Access denied")) {
      throw err;
    }
    assertPersistentDatabase("searchWorkspaceEntities", err);

    // Verify membership in memory store
    const memMember = memoryStore.workspaceMembers.find(
      (m) => m.workspaceId === workspaceId && m.userId === currentUserId
    );
    if (!memMember) {
      throw new Error("Access denied: You are not a member of this workspace.");
    }

    const matchedIdeas = memoryStore.ideas
      .filter(
        (i) =>
          i.workspaceId === workspaceId &&
          (i.title.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q)))
      )
      .slice(0, 10)
      .map((i) => ({
        id: i.id,
        type: "idea" as const,
        title: i.title,
        subtitle: i.category || "Idea",
        badge: i.status,
        url: `/ideas?id=${i.id}`,
      }));

    const matchedCharacters = memoryStore.characters
      .filter(
        (c) =>
          c.workspaceId === workspaceId &&
          (c.name.toLowerCase().includes(q) ||
            c.role.toLowerCase().includes(q) ||
            (c.description && c.description.toLowerCase().includes(q)))
      )
      .slice(0, 10)
      .map((c) => ({
        id: c.id,
        type: "character" as const,
        title: c.name,
        subtitle: `${c.role} Character`,
        badge: c.role,
        url: `/characters?id=${c.id}`,
      }));

    const matchedScripts = memoryStore.scripts
      .filter(
        (s) =>
          s.workspaceId === workspaceId &&
          (s.title.toLowerCase().includes(q) ||
            (s.description && s.description.toLowerCase().includes(q)) ||
            (s.hook && s.hook.toLowerCase().includes(q)))
      )
      .slice(0, 10)
      .map((s) => ({
        id: s.id,
        type: "script" as const,
        title: s.title,
        subtitle: s.description || s.hook || "Script",
        badge: s.status,
        url: `/scripts?id=${s.id}`,
      }));

    const matchedVideos = memoryStore.videos
      .filter(
        (v) =>
          v.workspaceId === workspaceId &&
          (v.title.toLowerCase().includes(q) || (v.description && v.description.toLowerCase().includes(q)))
      )
      .slice(0, 10)
      .map((v) => ({
        id: v.id,
        type: "video" as const,
        title: v.title,
        subtitle: `${v.platform} Video`,
        badge: v.status,
        url: `/videos?id=${v.id}`,
      }));

    return [...matchedIdeas, ...matchedCharacters, ...matchedScripts, ...matchedVideos];
  }
}
