import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next") ?? "/account";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/account";

  if (code) {
    const supabase = await createServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const forwardedHost = request.headers.get("x-forwarded-host");
        const redirectOrigin = process.env.NODE_ENV === "development" || !forwardedHost
          ? origin
          : `https://${forwardedHost}`;
        const response = NextResponse.redirect(`${redirectOrigin}${next}`);
        response.headers.set("Cache-Control", "private, no-store");
        return response;
      }
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth_callback_failed", origin));
}
