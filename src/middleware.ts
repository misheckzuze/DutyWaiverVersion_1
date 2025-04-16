import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken");
  const pathname = request.nextUrl.pathname;

  // Skip middleware for public files and API routes
  if (
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/api/') || 
    pathname.startsWith('/public/') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // // If the user is not logged in and trying to access a protected route
  // if (!token && !["/signin", "/signup"].includes(pathname)) {
  //   return NextResponse.redirect(new URL("/signin", request.url));
  // }

  // // If the user is logged in and trying to access the signin or register page, redirect to home
  // if (token && ["/signin", "/signup"].includes(pathname)) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - files with extensions (e.g., .jpg, .png, .css, .js)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.).*)',
  ],
};