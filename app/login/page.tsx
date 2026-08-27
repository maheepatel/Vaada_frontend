"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/components/auth-provider";
import { getBrowserSupabase } from "@/lib/supabase/client";

type Mode = "login" | "signup" | "magic";
const destinationFromLocation = () => {
  if (typeof window === "undefined") return "/account";
  const value = new URLSearchParams(window.location.search).get("next") ?? "/account";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/account";
};

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { configured, loading, signedIn } = useAuth();

  useEffect(() => {
    if (!loading && signedIn) router.replace(destinationFromLocation());
  }, [loading, router, signedIn]);

  const signInWithGoogle = async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return toast.error("Authentication is not configured yet.");
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}${destinationFromLocation()}` } });
    if (error) {
      setBusy(false);
      toast.error(error.message);
    }
  };

  const authenticate = async (event: FormEvent) => {
    event.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return toast.error("Authentication is not configured yet.");
    setBusy(true);
    try {
      const destination = destinationFromLocation();
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}${destination}` } });
        if (error) throw error;
        toast.success("Check your email for the secure sign-in link.");
        return;
      }
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}${destination}` } });
        if (error) throw error;
        if (!data.session) toast.success("Account created. Confirm the link sent to your email.");
        else {
          toast.success("Account created.");
          router.push(destination);
        }
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in securely.");
      router.push(destination);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  return <main className="site-shell route-shell"><SiteHeader/><section className="login-page"><form onSubmit={authenticate}>
    <p className="eyebrow">SECURE VAADA ACCOUNT</p>
    <h1>{mode === "signup" ? <>Create your<br/>account.</> : <>Return to<br/>your records.</>}</h1>
    <p>A verified Google or email account is required to submit promises, upload proof or view private receipts. You can still keep your public contribution anonymous.</p>
    {!configured && <p className="setup-notice" role="status">Authentication is waiting for the Supabase environment variables.</p>}
    <button type="button" className="google-auth-button" onClick={signInWithGoogle} disabled={!configured || busy}><span aria-hidden="true">G</span> Continue with Google <i>↗</i></button>
    <div className="auth-divider"><span>OR USE EMAIL</span></div>
    <div className="auth-mode" role="tablist" aria-label="Account access"><button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button><button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Sign up</button><button type="button" className={mode === "magic" ? "active" : ""} onClick={() => setMode("magic")}>Email link</button></div>
    <label>Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)}/></label>
    {mode !== "magic" && <label>Password<input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)}/></label>}
    <button className="button button-primary" disabled={!configured || busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account →" : mode === "magic" ? "Send secure link →" : "Login →"}</button>
    <p className="auth-privacy-note">Your account ID stays private. Choosing “submit anonymously” removes your name and email from the public record, not from Vaada&apos;s protected abuse-prevention audit.</p>
  </form></section></main>;
}
