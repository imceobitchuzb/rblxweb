import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

const DEFAULT_SECRET = "roxie-hub-secure-auth-jwt-secret-token-32-bytes-minimum";

function getMiddlewareSecret(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.length < 32) {
      return null;
    }
    return new TextEncoder().encode(secret);
  }
  return new TextEncoder().encode(secret || DEFAULT_SECRET);
}

const PROTECTED_ROUTES = [
  "/dashboard",
  "/ideas",
  "/characters",
  "/scripts",
  "/videos",
  "/calendar",
  "/analytics",
  "/settings",
];

const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalizedPath = pathname.toLowerCase();
  const sessionCookie = request.cookies.get("roxie_session")?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => normalizedPath === route || normalizedPath.startsWith(`${route}/`)
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => normalizedPath === route || normalizedPath.startsWith(`${route}/`)
  );

  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      const secret = getMiddlewareSecret();
      if (secret) {
        const { payload } = await jwtVerify(sessionCookie, secret);
        if (payload && payload.sub) {
          isAuthenticated = true;
        }
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // If user is accessing a protected route without a valid session, redirect to /login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(loginUrl);
    // If an invalid cookie was present, clear it
    if (sessionCookie) {
      response.cookies.delete("roxie_session");
    }
    return response;
  }

  // If user is already authenticated and tries to visit /login or /register, redirect to /dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ideas/:path*",
    "/characters/:path*",
    "/scripts/:path*",
    "/videos/:path*",
    "/calendar/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
