import { prisma } from "../prisma";
import { UserProfileData } from "../types";
import { memoryStore, assertPersistentDatabase } from "./store";
import { recordAuditEvent } from "./audit";

/**
 * Validates timezone string or defaults to "UTC".
 */
function normalizeTimezone(tz?: string): string {
  if (!tz) return "UTC";
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

/**
 * Retrieves a user's full profile details.
 */
export async function getUserProfile(userId: string): Promise<UserProfileData> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User profile not found.");
    }

    return {
      id: user.id,
      name: user.name || "Creator",
      email: user.email,
      creatorTag: user.creatorTag || "",
      avatarUrl: user.avatarUrl || "",
      bio: user.bio || "",
      timezone: user.timezone || "UTC",
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes("User profile not found")) {
      throw err;
    }
    assertPersistentDatabase("getUserProfile", err);

    const memUser = memoryStore.users.find((u) => u.id === userId);
    if (!memUser) {
      throw new Error("User profile not found.");
    }

    return {
      id: memUser.id,
      name: memUser.name || "Creator",
      email: memUser.email,
      creatorTag: memUser.creatorTag || "",
      avatarUrl: memUser.avatarUrl || "",
      bio: memUser.bio || "",
      timezone: memUser.timezone || "UTC",
    };
  }
}

/**
 * Updates a user's profile details.
 * Prevents editing email, password, or other users' profiles.
 */
export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    creatorTag?: string;
    avatarUrl?: string;
    bio?: string;
    timezone?: string;
  },
  workspaceId?: string
): Promise<UserProfileData> {
  // Field validation
  const updateData: {
    name?: string;
    creatorTag?: string;
    avatarUrl?: string;
    bio?: string;
    timezone?: string;
  } = {};

  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    if (!trimmed) {
      throw new Error("Profile name cannot be blank.");
    }
    if (trimmed.length > 60) {
      throw new Error("Profile name cannot exceed 60 characters.");
    }
    updateData.name = trimmed;
  }

  if (data.creatorTag !== undefined) {
    const tag = data.creatorTag.trim();
    if (tag.length > 30) {
      throw new Error("Creator tag cannot exceed 30 characters.");
    }
    updateData.creatorTag = tag;
  }

  if (data.avatarUrl !== undefined) {
    const trimmed = data.avatarUrl.trim();
    if (trimmed && !trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      throw new Error("Avatar URL must be a valid HTTP or HTTPS URL.");
    }
    updateData.avatarUrl = trimmed;
  }

  if (data.bio !== undefined) {
    if (data.bio.length > 500) {
      throw new Error("Bio cannot exceed 500 characters.");
    }
    updateData.bio = data.bio.trim();
  }

  if (data.timezone !== undefined) {
    updateData.timezone = normalizeTimezone(data.timezone);
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    if (workspaceId) {
      await recordAuditEvent({
        workspaceId,
        actorId: userId,
        action: "PROFILE_UPDATED",
        entityType: "USER",
        entityId: userId,
        metadata: { updatedFields: Object.keys(updateData) },
      });
    }

    return {
      id: updated.id,
      name: updated.name || "Creator",
      email: updated.email,
      creatorTag: updated.creatorTag || "",
      avatarUrl: updated.avatarUrl || "",
      bio: updated.bio || "",
      timezone: updated.timezone || "UTC",
    };
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("cannot exceed") ||
        err.message.includes("cannot be blank") ||
        err.message.includes("valid HTTP"))
    ) {
      throw err;
    }
    assertPersistentDatabase("updateUserProfile", err);

    const memUser = memoryStore.users.find((u) => u.id === userId);
    if (!memUser) {
      throw new Error("User profile not found.");
    }

    if (updateData.name !== undefined) memUser.name = updateData.name;
    if (updateData.creatorTag !== undefined) memUser.creatorTag = updateData.creatorTag;
    if (updateData.avatarUrl !== undefined) memUser.avatarUrl = updateData.avatarUrl;
    if (updateData.bio !== undefined) memUser.bio = updateData.bio;
    if (updateData.timezone !== undefined) memUser.timezone = updateData.timezone;

    if (workspaceId) {
      await recordAuditEvent({
        workspaceId,
        actorId: userId,
        action: "PROFILE_UPDATED",
        entityType: "USER",
        entityId: userId,
        metadata: { updatedFields: Object.keys(updateData) },
      });
    }

    return {
      id: memUser.id,
      name: memUser.name,
      email: memUser.email,
      creatorTag: memUser.creatorTag || "",
      avatarUrl: memUser.avatarUrl || "",
      bio: memUser.bio || "",
      timezone: memUser.timezone || "UTC",
    };
  }
}
