"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { VaadaLogo } from "@/components/vaada-logo";
import { getBrowserSupabase } from "@/lib/supabase/client";
import styles from "./auth-form.module.css";

type Mode = "login" | "signup" | "forgot" | "recovery";

const destinationFromLocation = () => {
  if (typeof window === "undefined") return "/account";
  const value = new URLSearchParams(window.location.search).get("next") ?? "/account";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/account";
};

function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.3Z" />
    <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.8 5.8 0 0 1-5.5-4H3.2v2.6A10 10 0 0 0 12 22Z" />
    <path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.9V7.5H3.2a10 10 0 0 0 0 9.1L6.5 14Z" />
    <path fill="#EA4335" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 3.2 7.5l3.3 2.6A5.8 5.8 0 0 1 12 6Z" />
  </svg>;
}

function PasswordField({ label, value, onChange, autoComplete }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return <label className={styles.field}>{label}<span className={styles.passwordWrap}>
    <input type={visible ? "text" : "password"} autoComplete={autoComplete} required minLength={8} value={value} onChange={(event) => onChange(event.target.value)} />
    <button className={styles.showButton} type="button" onClick={() => setVisible((current) => !current)} aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}>{visible ? "Hide" : "Show"}</button>
  </span></label>;
}

export function AuthForm({ initialMode }: { initialMode: "login" | "signup" }) {
  const [selectedMode, setSelectedMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, signedIn } = useAuth();
  const mode: Mode = searchParams.get("mode") === "recovery" ? "recovery" : selectedMode;
  const nextQuery = searchParams.get("next");
  const nextSuffix = nextQuery ? `?next=${encodeURIComponent(nextQuery)}` : "";

  useEffect(() => {
    if (!loading && signedIn && mode !== "recovery") router.replace(destinationFromLocation());
  }, [loading, mode, router, signedIn]);

  const title = useMemo(() => {
    if (mode === "signup") return "Create account";
    if (mode === "forgot") return "Reset your password";
    if (mode === "recovery") return "Choose a new password";
    return "Log in";
  }, [mode]);

  const chooseMode = (nextMode: Mode) => {
    setSelectedMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    if (nextMode === "login") {
      const params = new URLSearchParams(window.location.search);
      params.delete("mode");
      const query = params.toString();
      window.history.replaceState(null, "", `/login${query ? `?${query}` : ""}`);
    }
  };

  const failUnavailable = () => {
    const message = "We could not start sign-in. Please try again.";
    setErrorMessage(message);
    toast.error(message);
  };

  const signInWithGoogle = async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return failUnavailable();
    setBusy(true);
    setErrorMessage("");
    const destination = destinationFromLocation();
    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`;
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callbackUrl } });
    if (error) {
      setBusy(false);
      const message = "Google sign-in could not be started. Please try again.";
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const authenticate = async (event: FormEvent) => {
    event.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return failUnavailable();
    if ((mode === "signup" || mode === "recovery") && password !== confirmPassword) {
      const message = "The passwords do not match.";
      setErrorMessage(message);
      return toast.error(message);
    }
    setBusy(true);
    setErrorMessage("");
    try {
      const destination = destinationFromLocation();
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login?mode=recovery` });
        if (error) throw error;
        toast.success("If an account exists for that email, a reset link is on its way.");
        chooseMode("login");
        return;
      }
      if (mode === "recovery") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast.success("Your password has been updated.");
        router.replace("/account");
        return;
      }
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name.trim() }, emailRedirectTo: `${window.location.origin}${destination}` },
        });
        if (error) throw error;
        if (!data.session) toast.success("Account created. Check your email to confirm it.");
        else {
          toast.success("Account created.");
          router.push(destination);
        }
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("You are logged in.");
      router.push(destination);
    } catch {
      const message = mode === "signup"
        ? "We could not create your account. Check your details and try again."
        : mode === "forgot"
          ? "We could not send a reset link. Please try again."
          : mode === "recovery"
            ? "We could not update your password. Please request a new reset link."
            : "We could not log you in. Check your details and try again.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return <section className={styles.authPage}>
    <div className={styles.authTopbar}>
      <VaadaLogo className={styles.logo} tagline tone="dark" />
    </div>
    <div className={styles.authPanel}>
    <div className={styles.heading}>
      <h1>{title}</h1>
      {mode === "login" && <p className={styles.switchText}>New to Vaada? <Link className={styles.highlightLink} href={`/signup${nextSuffix}`}>Create an account</Link></p>}
      {mode === "signup" && <p className={styles.switchText}>Already have an account? <Link className={styles.highlightLink} href={`/login${nextSuffix}`}>Log in</Link></p>}
    </div>
    {(mode === "login" || mode === "signup") && <button type="button" className={styles.googleButton} onClick={signInWithGoogle} disabled={busy}><GoogleMark /><span>Continue with Google</span></button>}
    {(mode === "login" || mode === "signup") && <div className={styles.divider}><span>or</span></div>}
    <form className={styles.form} onSubmit={authenticate}>
      {errorMessage && <p className={styles.error} role="alert">{errorMessage}</p>}
      {mode === "signup" && <label className={styles.field}>Full name<input type="text" autoComplete="name" required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} /></label>}
      {mode !== "recovery" && <label className={styles.field}>Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>}
      {mode !== "forgot" && <PasswordField label={mode === "recovery" ? "New password" : "Password"} value={password} onChange={setPassword} autoComplete={mode === "login" ? "current-password" : "new-password"} />}
      {(mode === "signup" || mode === "recovery") && <PasswordField label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />}
      {mode === "login" && <button className={styles.forgotButton} type="button" onClick={() => chooseMode("forgot")}>Forgot password?</button>}
      <button className={styles.primaryButton} disabled={busy}>{busy ? "Please wait" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : mode === "recovery" ? "Save new password" : "Log in"}</button>
      {(mode === "forgot" || mode === "recovery") && <button className={styles.secondaryButton} type="button" onClick={() => chooseMode("login")}>Back to login</button>}
    </form>
  </div></section>;
}
