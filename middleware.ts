// middleware.ts (NextAuth v4)
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.nextauth?.token;
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/workout/today", req.url));
  }
  return NextResponse.next();
}, {
  callbacks: {
    authorized: ({ req, token }) => {
      const { pathname } = req.nextUrl;
      const isPublic =
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/public") ||
        pathname.startsWith("/favicon.ico");
      if (isPublic) return true;
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    "/",
    "/workout/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/app/(protected)/:path*",
  ],
};
