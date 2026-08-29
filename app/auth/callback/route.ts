import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { safeAuthDestination } from "@/lib/auth-redirect";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeAuthDestination(searchParams.get("next"));
  const forwardedHost = request.headers.get("x-forwarded-host");
  const redirectOrigin = process.env.NODE_ENV === "development" || !forwardedHost
    ? origin
    : `https://${forwardedHost}`;

  if (code) {
    const supabase = await createServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const response = NextResponse.redirect(`${redirectOrigin}${next}`);
        response.headers.set("Cache-Control", "private, no-store");
        return response;
      }
    }
  }

  const login = new URL("/login", redirectOrigin);
  login.searchParams.set("error", "auth_callback_failed");
  if (next !== "/") login.searchParams.set("next", next);
  return NextResponse.redirect(login);
}
