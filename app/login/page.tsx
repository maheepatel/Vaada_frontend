"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { getBrowserSupabase } from "@/lib/supabase/client";

type Mode = "login" | "signup" | "magic";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const destination = typeof window === "undefined" ? "/account" : new URLSearchParams(window.location.search).get("next") || "/account";

  const authenticate = async (event: FormEvent) => {
    event.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return toast.error("Authentication is not configured yet.");
    setBusy(true);
    try {
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/account` } });
        if (error) throw error;
        toast.success("Check your email for the secure sign in link.");
        return;
      }
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/account` } });
        if (error) throw error;
        if (!data.session) toast.success("Account created. Confirm the link sent to your email.");
        else { toast.success("Account created."); router.push(destination); }
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in securely.");
      router.push(destination);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.");
    } finally { setBusy(false); }
  };

  return <main className="site-shell route-shell"><SiteHeader/><section className="login-page"><form onSubmit={authenticate}><p className="eyebrow">SECURE VAADA ACCOUNT</p><h1>{mode === "signup" ? <>Create your<br/>account.</> : <>Return to<br/>your records.</>}</h1><p>Citizens can submit anonymously. An account lets you recover private receipts across devices. Reviewer access still requires an approved reviewer role.</p><div className="auth-mode" role="tablist" aria-label="Account access"><button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button><button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Sign up</button><button type="button" className={mode === "magic" ? "active" : ""} onClick={() => setMode("magic")}>Email link</button></div><label>Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)}/></label>{mode !== "magic" && <label>Password<input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)}/></label>}<button className="button button-primary" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account →" : mode === "magic" ? "Send secure link →" : "Login →"}</button><a className="reviewer-login-link" href="/login?next=/review">Approved reviewer? Continue to the review queue ↗</a></form></section></main>;
}
