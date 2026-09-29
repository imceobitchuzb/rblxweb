import { prisma } from "../prisma";
import { AuditAction, AuditLog } from "../types";
import { memoryStore, assertPersistentDatabase } from "./store";

const FORBIDDEN_METADATA_KEYS = [
  "password",
  "passwordhash",
  "token",
  "tokenhash",
  "secret",
  "session",
  "cookie",
  "jwt",
  "authorization",
];

function sanitizeAuditMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    if (FORBIDDEN_METADATA_KEYS.some((forbidden) => lowerKey.includes(forbidden))) {
      continue;
    }
    if (typeof value === "string" && value.length > 200) {
      sanitized[key] = `${value.slice(0, 200)}...`;
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Records an immutable audit log entry scoped strictly to a workspace.
 * Automatically sanitizes metadata to prevent accidental storage of secrets.
 */
export async function recordAuditEvent(data: {
  workspaceId: string;
  actorId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<AuditLog> {
  const cleanMeta = sanitizeAuditMetadata(data.metadata);

  try {
    const created = await prisma.auditLog.create({
      data: {
        workspaceId: data.workspaceId,
        actorId: data.actorId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId || null,
        metadata: (cleanMeta as never) || undefined,
      },
    });

    const entry: AuditLog = {
      id: created.id,
      workspaceId: created.workspaceId,
      actorId: created.actorId,
      action: created.action as AuditAction,
      entityType: created.entityType,
      entityId: created.entityId || undefined,
      metadata: cleanMeta,
      createdAt: created.createdAt.toISOString(),
    };

    memoryStore.auditLogs.unshift(entry);
    return entry;
  } catch (err) {
    assertPersistentDatabase("recordAuditEvent", err);
    const entry: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      workspaceId: data.workspaceId,
      actorId: data.actorId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      metadata: cleanMeta,
      createdAt: new Date().toISOString(),
    };
    memoryStore.auditLogs.unshift(entry);
    return entry;
  }
}

/**
 * Retrieves audit logs for a workspace.
 * Requires that currentUserId is an authorized member of the workspace.
 */
export async function getWorkspaceAuditLogs(
  workspaceId: string,
  currentUserId: string,
  limit = 50
): Promise<AuditLog[]> {
  try {
    // 1. Verify membership
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: currentUserId,
        },
      },
    });

    if (!membership) {
      throw new Error("Access denied: You are not a member of this workspace.");
    }

    const logs = await prisma.auditLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return logs.map((log) => ({
      id: log.id,
      workspaceId: log.workspaceId,
      actorId: log.actorId,
      action: log.action as AuditAction,
      entityType: log.entityType,
      entityId: log.entityId || undefined,
      metadata: (log.metadata as Record<string, unknown>) || undefined,
      createdAt: log.createdAt.toISOString(),
    }));
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Access denied")) {
      throw err;
    }
    assertPersistentDatabase("getWorkspaceAuditLogs", err);

    // Verify membership in memory store
    const memMember = memoryStore.workspaceMembers.find(
      (m) => m.workspaceId === workspaceId && m.userId === currentUserId
    );
    if (!memMember) {
      throw new Error("Access denied: You are not a member of this workspace.");
    }

    return memoryStore.auditLogs
      .filter((l) => l.workspaceId === workspaceId)
      .slice(0, limit);
  }
}
