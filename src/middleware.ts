import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

export function middleware(request: NextRequest) {
  // Get token from cookies instead of localStorage (which doesn't work in middleware)
  const token = request.cookies.get("token")?.value;


  // Check if the request is for a static asset (images, logos, etc.)
  const isStaticAsset = /\.(png|jpg|jpeg|gif|svg|ico|webp|css|js)$/i.test(
    request.nextUrl.pathname
  );

  // Allow static assets to pass through without authentication
  if (isStaticAsset) {
    return NextResponse.next();
  }

  // Public paths that don't require authentication
  const isPublicPath =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/signin" ||
    request.nextUrl.pathname === "/signup" ||
    request.nextUrl.pathname === "/about" ||
    request.nextUrl.pathname === "/contact" ||
    request.nextUrl.pathname === "/courses" ||
    request.nextUrl.pathname.startsWith("/courses/") ||
    request.nextUrl.pathname === "/teacher" ||
    request.nextUrl.pathname === "/request-password-reset" ||
    request.nextUrl.pathname.startsWith("/invitation");

  // If user is on a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Protected paths that require authentication (dashboard and admin routes)
  const isProtectedPath = 
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/admin");

  // For protected routes, check if token exists
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Only proceed with token validation if a token exists and user is accessing protected routes
  if (token && isProtectedPath) {
    try {
      // Try to decode token to get user info
      const userInfo = jwtDecode(token) as { role?: string; exp: number };

      // Check token expiration if exp field exists
      if (userInfo.exp && userInfo.exp * 1000 < Date.now()) {
        return NextResponse.redirect(new URL("/signin", request.url));
      }

      const currentPath = request.nextUrl.pathname;

      // Restrict access to admin paths if user is not an ADMIN
      if (currentPath.startsWith("/admin") && userInfo?.role !== "admin") {
        return NextResponse.redirect(new URL("/signin", request.url));
      }

      // Allow access to dashboard routes for authenticated users
    } catch (error) {
      console.log('Token decode error:', error);
      // If token is invalid, redirect to signin for protected routes
      if (isProtectedPath) {
        return NextResponse.redirect(new URL("/signin", request.url));
      }
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static, /images, /favicon.ico, etc.
     * 4. Static assets in public directory (images, logos, etc.)
     */
    "/((?!api|_next|static|images|favicon.ico).*)",
  ],
};
