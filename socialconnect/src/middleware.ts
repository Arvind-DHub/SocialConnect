import { NextRequest, NextResponse } from "next/server";
import { verifyJWT, extractToken } from "@/lib/jwt";

// Pages that need the user to be logged in — otherwise redirect to /login
const protectedRoutes = ["/feed", "/profile", "/posts/new"];

// Pages for guests only — logged-in users are redirected to /feed
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Get token from cookie (we set this when logging in)
  const token = request.cookies.get("auth-token")?.value;
  const isLoggedIn = token ? !!(await verifyJWT(token)) : false;

  if (isProtectedRoute && !isLoggedIn) {
    // Remember where they were going so we can redirect after login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return NextResponse.next();
}

// Only run middleware on these paths
// Excludes static files, images, api routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
