// app/middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If user is logged in, continue
  if (token) return NextResponse.next();

  // Otherwise redirect to login
  const loginURL = new URL("/authentication/login", req.url);
  loginURL.searchParams.set(
    "callbackUrl",
    req.nextUrl.pathname + req.nextUrl.search
  );
  return NextResponse.redirect(loginURL);
}

// Apply middleware only to specific paths
export const config = {
  matcher: ["/dashboard/:path*"], // paths you want protected
};
