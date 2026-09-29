import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SessionPayload } from "../types";

export const SESSION_COOKIE_NAME = "roxie_session";
const SESSION_EXPIRATION = "7d";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

const DEFAULT_SECRET = "roxie-hub-secure-auth-jwt-secret-token-32-bytes-minimum";

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

/**
 * Creates a signed JWT session token containing user and workspace context.
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const secretKey = getSecretKey();

  return new SignJWT({
    email: payload.email,
    workspaceId: payload.workspaceId,
    role: payload.role,
    name: payload.name,
    creatorTag: payload.creatorTag,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRATION)
    .sign(secretKey);
}

/**
 * Verifies and decodes a signed JWT session token.
 * Returns null if token is invalid or expired.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);

    if (!payload.sub || typeof payload.email !== "string" || typeof payload.workspaceId !== "string") {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      workspaceId: payload.workspaceId,
      role: (payload.role as SessionPayload["role"]) || "MEMBER",
      name: typeof payload.name === "string" ? payload.name : undefined,
      creatorTag: typeof payload.creatorTag === "string" ? payload.creatorTag : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Reads the session token from the HTTP request cookies.
 * Gracefully returns undefined if outside a Next.js request context (e.g. scripts/tests).
 */
export async function getSessionCookie(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE_NAME)?.value;
  } catch {
    return undefined;
  }
}

/**
 * Sets the signed session token in an HTTP-only, secure cookie.
 */
export async function setSessionCookie(token: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
  } catch {
    // In environments where cookies() is read-only or unavailable
  }
}

/**
 * Clears the session cookie on logout.
 */
export async function clearSessionCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    // Graceful fallback
  }
}
