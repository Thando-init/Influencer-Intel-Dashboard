import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
  });

  const { pathname } = request.nextUrl;

  // Protect /app/* routes
  if (pathname.startsWith("/app")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect to app if already logged in and trying to access auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (token) {
      return NextResponse.redirect(new URL("/app/analyse", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login", "/signup"],
};
