/**
 * URL sanitization utilities for authentication and redirection.
 * Safe to import in both Client and Server environments.
 */

/**
 * Validates and sanitizes a callback redirect URL against Open Redirect attacks.
 * Only allows relative paths starting with a single '/' (disallowing '//', '/\', or protocol schemes).
 */
export function getSafeCallbackUrl(url: string | null | undefined, fallback = "/dashboard"): string {
  if (!url || typeof url !== "string") return fallback;
  const trimmed = url.trim();
  // Must start with single slash, disallowing protocol-relative '//', backslash '/\', or external URLs
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }
  // Disallow CRLF / control chars or URL scheme tricks like '/javascript:...'
  if (/[\r\n\t]/.test(trimmed) || /^\/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return fallback;
  }
  return trimmed;
}
