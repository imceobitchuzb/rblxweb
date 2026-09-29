"use server";

import { getAuthContext } from "../../lib/auth/context";
import { ActionResult, errorResult, successResult } from "../../lib/server/types";
import { WorkspaceDashboardData } from "../../lib/types";
import { getWorkspaceDashboardMetrics } from "../../lib/server/dashboard";

export async function fetchWorkspaceDashboardAction(): Promise<
  ActionResult<WorkspaceDashboardData>
> {
  try {
    const ctx = await getAuthContext();
    const data = await getWorkspaceDashboardMetrics(ctx.workspace.id, ctx.user.id);
    return successResult(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load dashboard data.";
    return errorResult(msg);
  }
}
