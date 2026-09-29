import { prisma } from "../prisma";
import { getCurrentUserId } from "./user-context";
import { memoryStore, assertPersistentDatabase, UserSettingsRecord } from "./store";

export async function getUserSettings(userId?: string): Promise<UserSettingsRecord> {
  const activeUserId = userId || (await getCurrentUserId());

  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: activeUserId },
    });
    if (settings) {
      return {
        id: settings.id,
        userId: settings.userId,
        theme: settings.theme,
        emailNotifications: settings.emailNotifications,
        browserNotifications: settings.browserNotifications,
        defaultPlatform: settings.defaultPlatform,
        connectedYoutube: settings.connectedYoutube,
        connectedTiktok: settings.connectedTiktok,
      };
    }
  } catch (err) {
    assertPersistentDatabase("getUserSettings", err);
  }

  return (
    memoryStore.settings[activeUserId] || {
      id: `settings-${activeUserId}`,
      userId: activeUserId,
      theme: "dark",
      emailNotifications: true,
      browserNotifications: true,
      defaultPlatform: "YOUTUBE",
      connectedYoutube: false,
      connectedTiktok: false,
    }
  );
}

export async function updateUserSettingsRecord(
  data: Partial<Omit<UserSettingsRecord, "id" | "userId">>,
  userId?: string
): Promise<UserSettingsRecord> {
  const activeUserId = userId || (await getCurrentUserId());

  try {
    const updated = await prisma.userSettings.upsert({
      where: { userId: activeUserId },
      update: {
        ...(data.theme !== undefined ? { theme: data.theme } : {}),
        ...(data.emailNotifications !== undefined ? { emailNotifications: data.emailNotifications } : {}),
        ...(data.browserNotifications !== undefined ? { browserNotifications: data.browserNotifications } : {}),
        ...(data.defaultPlatform !== undefined ? { defaultPlatform: data.defaultPlatform as never } : {}),
        ...(data.connectedYoutube !== undefined ? { connectedYoutube: data.connectedYoutube } : {}),
        ...(data.connectedTiktok !== undefined ? { connectedTiktok: data.connectedTiktok } : {}),
      },
      create: {
        userId: activeUserId,
        theme: data.theme || "dark",
        emailNotifications: data.emailNotifications ?? true,
        browserNotifications: data.browserNotifications ?? true,
        defaultPlatform: (data.defaultPlatform || "YOUTUBE") as never,
        connectedYoutube: data.connectedYoutube ?? false,
        connectedTiktok: data.connectedTiktok ?? false,
      },
    });

    const res: UserSettingsRecord = {
      id: updated.id,
      userId: updated.userId,
      theme: updated.theme,
      emailNotifications: updated.emailNotifications,
      browserNotifications: updated.browserNotifications,
      defaultPlatform: updated.defaultPlatform,
      connectedYoutube: updated.connectedYoutube,
      connectedTiktok: updated.connectedTiktok,
    };
    memoryStore.settings[activeUserId] = res;
    return res;
  } catch (err) {
    assertPersistentDatabase("updateUserSettingsRecord", err);
    const existing = memoryStore.settings[activeUserId] || {
      id: `settings-${activeUserId}`,
      userId: activeUserId,
      theme: "dark",
      emailNotifications: true,
      browserNotifications: true,
      defaultPlatform: "YOUTUBE",
      connectedYoutube: false,
      connectedTiktok: false,
    };
    const updated: UserSettingsRecord = { ...existing, ...data };
    memoryStore.settings[activeUserId] = updated;
    return updated;
  }
}
