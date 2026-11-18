import { NextResponse, type NextRequest } from "next/server";

// Any page except /login needs a session cookie. API routes check it themselves.
export function middleware(req: NextRequest) {
  if (!req.cookies.get("planner_token")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api|_next|favicon.ico|icon.svg).*)"],
};
