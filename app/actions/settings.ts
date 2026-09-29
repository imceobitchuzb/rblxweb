"use server";

import { revalidatePath } from "next/cache";
import { getUserSettings, updateUserSettingsRecord } from "../../lib/server/settings";
import { UserSettingsRecord } from "../../lib/server/store";
import { ActionResult, errorResult, successResult } from "../../lib/server/types";

export async function fetchUserSettingsAction(): Promise<ActionResult<UserSettingsRecord>> {
  try {
    const settings = await getUserSettings();
    return successResult(settings);
  } catch {
    return errorResult("Failed to fetch user settings.");
  }
}

export async function updateUserSettingsAction(
  data: Partial<Omit<UserSettingsRecord, "id" | "userId">>
): Promise<ActionResult<UserSettingsRecord>> {
  try {
    const updated = await updateUserSettingsRecord(data);
    revalidatePath("/settings");
    return successResult(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update settings.";
    return errorResult(message);
  }
}
