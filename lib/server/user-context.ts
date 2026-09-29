/**
 * User & Workspace Context Abstraction for Server Actions and Data Access
 *
 * In Phase 6, this provides a deterministic demo user identity ("user-creator-roxie")
 * ensuring all database records are correctly scoped by `userId`.
 * In Phase 7 (Authentication), this will extract the authenticated session
 * (e.g., NextAuth, JWT, or Supabase Auth) without altering the data access interface.
 */

export const DEMO_USER_ID = "user-creator-roxie";
export const DEMO_USER_EMAIL = "roxie@bloxmedia.gg";
export const DEMO_USER_NAME = "Roxie Velocity";
export const DEMO_CREATOR_TAG = "ROXIE_PRO";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  creatorTag: string;
}

/**
 * Returns the current active user ID.
 * All Prisma database queries and mutations scope by this ID.
 */
export async function getCurrentUserId(): Promise<string> {
  return DEMO_USER_ID;
}

/**
 * Returns the current active user object.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  return {
    id: DEMO_USER_ID,
    email: DEMO_USER_EMAIL,
    name: DEMO_USER_NAME,
    creatorTag: DEMO_CREATOR_TAG,
  };
}
