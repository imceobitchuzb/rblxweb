"use server";

import { getAuthContext } from "../../lib/auth/context";
import { ActionResult, errorResult, successResult } from "../../lib/server/types";
import { searchWorkspaceEntities, WorkspaceSearchResult } from "../../lib/server/search";

export async function searchWorkspaceAction(
  query: string
): Promise<ActionResult<WorkspaceSearchResult[]>> {
  try {
    const ctx = await getAuthContext();
    const results = await searchWorkspaceEntities(ctx.workspace.id, query, ctx.user.id);
    return successResult(results);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Search failed.";
    return errorResult(msg);
  }
}
