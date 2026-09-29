"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext } from "../../lib/auth/context";
import { ActionResult, errorResult, successResult } from "../../lib/server/types";
import { UserProfileData } from "../../lib/types";
import { getUserProfile, updateUserProfile } from "../../lib/server/profile";

export async function fetchUserProfileAction(): Promise<ActionResult<UserProfileData>> {
  try {
    const ctx = await getAuthContext();
    const profile = await getUserProfile(ctx.user.id);
    return successResult(profile);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load profile.";
    return errorResult(msg);
  }
}

export async function updateUserProfileAction(data: {
  name?: string;
  creatorTag?: string;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
}): Promise<ActionResult<UserProfileData>> {
  try {
    const ctx = await getAuthContext();
    const updated = await updateUserProfile(ctx.user.id, data, ctx.workspace.id);
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return successResult(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update profile.";
    return errorResult(msg);
  }
}
