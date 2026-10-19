import { NextRequest, NextResponse } from "next/server";
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const target = new URL("/admin-unavailable", request.url);
    return NextResponse.redirect(target);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };