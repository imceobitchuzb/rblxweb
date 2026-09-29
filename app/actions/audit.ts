"use server";

import { getAuthContext } from "../../lib/auth/context";
import { ActionResult, errorResult, successResult } from "../../lib/server/types";
import { AuditLog } from "../../lib/types";
import { getWorkspaceAuditLogs } from "../../lib/server/audit";

export async function fetchWorkspaceAuditLogsAction(
  limit = 50
): Promise<ActionResult<AuditLog[]>> {
  try {
    const ctx = await getAuthContext();
    const logs = await getWorkspaceAuditLogs(ctx.workspace.id, ctx.user.id, limit);
    return successResult(logs);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load audit logs.";
    return errorResult(msg);
  }
}
