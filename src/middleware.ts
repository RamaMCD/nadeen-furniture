import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Returns true for routes that are fully public and do NOT need a Supabase
 * session check. Skipping `updateSession` on these paths means:
 *  1. No unnecessary network call to Supabase on every public page load.
 *  2. Public pages stay accessible even when the Supabase project is paused
 *     or the network is temporarily unreachable.
 */
function isPublicRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/company") ||
    pathname.startsWith("/catalog") ||
    pathname.startsWith("/contact")
  );
}

export async function middleware(request: NextRequest) {
  // Public routes: pass through immediately — no auth check needed.
  if (isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.next({ request });
  }

  // Dashboard + login routes: run full session refresh so the auth guard works.
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
