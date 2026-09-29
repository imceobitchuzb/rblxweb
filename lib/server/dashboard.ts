import { prisma } from "../prisma";
import { WorkspaceDashboardData, WorkspaceRole } from "../types";
import { memoryStore, assertPersistentDatabase } from "./store";
import { getIdeas } from "./ideas";
import { getCharacters } from "./characters";
import { getScripts } from "./scripts";
import { getVideos } from "./videos";
import { getCalendarEvents } from "./calendar";

/**
 * Returns comprehensive dashboard data strictly scoped to the active workspace.
 * Zero fabrication: accurately reports real entity counts, recents, and metrics.
 */
export async function getWorkspaceDashboardMetrics(
  workspaceId: string,
  currentUserId: string
): Promise<WorkspaceDashboardData> {
  // 1. Authorize requester membership and fetch workspace info
  let workspace: { id: string; name: string; slug: string; ownerId: string; createdAt: string; updatedAt: string };
  let role: WorkspaceRole = "MEMBER";

  try {
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: currentUserId,
        },
      },
      include: { workspace: true },
    });

    if (!membership) {
      throw new Error("Access denied: You are not a member of this workspace.");
    }

    workspace = {
      id: membership.workspace.id,
      name: membership.workspace.name,
      slug: membership.workspace.slug,
      ownerId: membership.workspace.ownerId,
      createdAt: membership.workspace.createdAt.toISOString(),
      updatedAt: membership.workspace.updatedAt.toISOString(),
    };
    role = membership.role as WorkspaceRole;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Access denied")) {
      throw err;
    }
    assertPersistentDatabase("getWorkspaceDashboardMetrics:membership", err);

    const memMember = memoryStore.workspaceMembers.find(
      (m) => m.workspaceId === workspaceId && m.userId === currentUserId
    );
    if (!memMember) {
      throw new Error("Access denied: You are not a member of this workspace.");
    }

    const memWs = memoryStore.workspaces.find((w) => w.id === workspaceId);
    if (!memWs) {
      throw new Error("Workspace not found.");
    }

    workspace = memWs;
    role = memMember.role;
  }

  // 2. Fetch scoped items
  const [allIdeas, allCharacters, allScripts, allVideos, allEvents] = await Promise.all([
    getIdeas(currentUserId, workspaceId),
    getCharacters(currentUserId, workspaceId),
    getScripts(currentUserId, workspaceId),
    getVideos(currentUserId, workspaceId),
    getCalendarEvents(currentUserId, workspaceId),
  ]);

  // Strictly filter to this workspace
  const ideas = allIdeas.filter((i) => i.workspaceId === workspaceId);
  const characters = allCharacters.filter((c) => c.workspaceId === workspaceId);
  const scripts = allScripts.filter((s) => s.workspaceId === workspaceId);
  const videos = allVideos.filter((v) => v.workspaceId === workspaceId);
  const events = allEvents.filter((e) => e.workspaceId === workspaceId);

  // Recents
  const recentIdeas = [...ideas]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  const recentScripts = [...scripts]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  const recentVideos = [...videos]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5);

  // Calculate analytics strictly from workspace videos
  const publishedVideos = videos.filter((v) => v.status === "PUBLISHED");
  const totalViews = publishedVideos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = publishedVideos.reduce((acc, v) => acc + (v.likes || 0), 0);
  const totalComments = publishedVideos.reduce((acc, v) => acc + (v.comments || 0), 0);
  const publishedVideosCount = publishedVideos.length;
  const averageViews = publishedVideosCount > 0 ? Math.round(totalViews / publishedVideosCount) : 0;
  const averageEngagementRate =
    publishedVideosCount > 0 && totalViews > 0
      ? Number((((totalLikes + totalComments) / totalViews) * 100).toFixed(2))
      : 0;

  return {
    workspace,
    role,
    counts: {
      ideas: ideas.length,
      characters: characters.length,
      scripts: scripts.length,
      videos: videos.length,
      events: events.length,
    },
    recentIdeas,
    recentScripts,
    recentVideos,
    upcomingEvents,
    analyticsSummary: {
      totalViews,
      totalLikes,
      totalComments,
      publishedVideosCount,
      averageViews,
      averageEngagementRate,
    },
  };
}
