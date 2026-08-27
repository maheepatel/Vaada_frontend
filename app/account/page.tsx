"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/components/auth-provider";
import { AuthGuard, ProtectedActionLink } from "@/components/protected-action";
import { getBrowserSupabase } from "@/lib/supabase/client";

export default function AccountPage() {
  const router = useRouter();
  const { user, role } = useAuth();
  const signOut = async () => {
    const supabase = getBrowserSupabase();
    const { error } = await supabase?.auth.signOut() ?? { error: null };
    if (error) return toast.error(error.message);
    toast.success("Signed out securely.");
    router.replace("/");
  };

  return <main className="site-shell route-shell"><SiteHeader/><AuthGuard><section className="account-page secure-account-page">
    <p className="eyebrow">YOUR VAADA ACCOUNT</p><h1>Account<br/>and records.</h1>
    <p className="detail-summary">Signed in as {user?.email ?? "verified account"}. Public anonymity is selected separately on each contribution.</p>
    <dl className="account-identity"><div><dt>Account role</dt><dd>{role ?? "citizen"}</dd></div><div><dt>Authentication</dt><dd>{user?.app_metadata?.provider === "google" ? "Google" : "Verified email"}</dd></div></dl>
    <div className="account-actions"><ProtectedActionLink className="button button-primary" href="/my-logs">My records →</ProtectedActionLink><ProtectedActionLink className="button button-ghost" href="/submit">Put one on record ＋</ProtectedActionLink>{role && ["reviewer","admin"].includes(role) && <ProtectedActionLink className="button button-ghost" href="/review" roles={["reviewer","admin"]}>Open review queue ✓</ProtectedActionLink>}<button className="button button-ghost" type="button" onClick={signOut}>Sign out</button></div>
  </section></AuthGuard></main>;
}
