import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Logout error:", err);
  }

  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url);

  for (const c of allCookies) {
    if (c.name.startsWith("sb-") || c.name.includes("auth-token")) {
      response.cookies.delete(c.name);
    }
  }

  return response;
}

