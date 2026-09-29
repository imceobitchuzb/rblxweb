import { CalendarEvent, IdeaItem, Script, Video } from "./types";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "action";
  href: string;
  timestamp: string;
  isRead: boolean;
}

/**
 * Derives actionable creator notifications deterministically from actual application records.
 */
export function deriveWorkspaceNotifications(
  videos: Video[],
  scripts: Script[],
  ideas: IdeaItem[],
  events: CalendarEvent[]
): NotificationItem[] {
  const notifications: NotificationItem[] = [];

  // 1. Scheduled videos
  const scheduledVideos = videos.filter((v) => v.status === "SCHEDULED" && v.scheduledAt);
  for (const video of scheduledVideos) {
    notifications.push({
      id: `notif-sched-${video.id}`,
      title: "Scheduled Release Approaching",
      message: `"${video.title}" is queued for ${video.platform.replace(/_/g, " ")}. Verify thumbnail & tags.`,
      type: "warning",
      href: `/videos?videoId=${video.id}`,
      timestamp: "2 hours ago",
      isRead: false,
    });
  }

  // 2. Videos in READY status awaiting scheduling
  const readyVideos = videos.filter((v) => v.status === "READY");
  for (const video of readyVideos) {
    notifications.push({
      id: `notif-ready-vid-${video.id}`,
      title: "Video Ready to Schedule",
      message: `"${video.title}" has completed editing and is ready to be placed on the publishing calendar.`,
      type: "action",
      href: `/videos?videoId=${video.id}`,
      timestamp: "5 hours ago",
      isRead: false,
    });
  }

  // 3. Screenplays marked READY for production
  const readyScripts = scripts.filter((s) => s.status === "READY");
  for (const script of readyScripts) {
    notifications.push({
      id: `notif-script-${script.id}`,
      title: "Screenplay Approved",
      message: `"${script.title}" has ${script.scenes.length} scenes approved for production.`,
      type: "success",
      href: `/scripts?scriptId=${script.id}`,
      timestamp: "1 day ago",
      isRead: true,
    });
  }

  // 4. Hot Ideas awaiting screenplay transition
  const hotIdeas = ideas.filter((i) => i.priority === "HOT" && i.status === "IDEA");
  if (hotIdeas.length > 0) {
    notifications.push({
      id: `notif-hot-idea`,
      title: "Viral Idea Opportunity",
      message: `"${hotIdeas[0].title}" is marked HOT 🔥 (Score: ${hotIdeas[0].potentialScore}/10). Advance to Script Studio.`,
      type: "info",
      href: `/ideas?search=${encodeURIComponent(hotIdeas[0].title)}`,
      timestamp: "1 day ago",
      isRead: false,
    });
  }

  // 5. Calendar premiere slots
  const premieres = events.filter((e) => e.type === "PREMIERE");
  if (premieres.length > 0) {
    notifications.push({
      id: `notif-prem-${premieres[0].id}`,
      title: "Live Premiere on Schedule",
      message: `Live stream premiere "${premieres[0].title}" planned. Community post reminder.`,
      type: "info",
      href: "/calendar",
      timestamp: "2 days ago",
      isRead: true,
    });
  }

  return notifications;
}
