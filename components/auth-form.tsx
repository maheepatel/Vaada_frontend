"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { VaadaLogo } from "@/components/vaada-logo";
import { safeAuthDestination } from "@/lib/auth-redirect";
import { getBrowserSupabase } from "@/lib/supabase/client";
import styles from "./auth-form.module.css";

type AuthMode = "login" | "signup";
type PanelMode = AuthMode | "forgot" | "recovery";

function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.3Z" />
    <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.8 5.8 0 0 1-5.5-4H3.2v2.6A10 10 0 0 0 12 22Z" />
    <path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.9V7.5H3.2a10 10 0 0 0 0 9.1L6.5 14Z" />
    <path fill="#EA4335" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 3.2 7.5l3.3 2.6A5.8 5.8 0 0 1 12 6Z" />
  </svg>;
}

function PasswordField({ value, onChange, autoComplete, label = "Password" }: { value: string; onChange: (value: string) => void; autoComplete: string; label?: string }) {
  const [visible, setVisible] = useState(false);
  return <label className={styles.field}>{label}<span className={styles.passwordWrap}>
    <input type={visible ? "text" : "password"} autoComplete={autoComplete} required minLength={8} value={value} onChange={(event) => onChange(event.target.value)} />
    <button className={styles.showButton} type="button" onClick={() => setVisible((current) => !current)} aria-label={`${visible ? "Hide" : "Show"} password`}>{visible ? "Hide" : "Show"}</button>
  </span></label>;
}

function authErrorCode(error: unknown) {
  return typeof error === "object" && error && "code" in error ? String(error.code) : "unknown";
}

function friendlyAuthError(error: unknown, mode: PanelMode) {
  const code = authErrorCode(error);
  if (code === "invalid_credentials") return "Email or password is incorrect.";
  if (code === "user_already_exists" || code === "user_already_registered" || code === "email_exists") return "An account already exists for this email. Log in instead.";
  if (code === "signup_disabled") return "New account creation is temporarily unavailable.";
  if (code === "instant_signup_session_missing") return "Your account was created, but automatic login is not enabled yet. Please contact support.";
  if (mode === "forgot") return "We could not send the password reset email. Please try again.";
  if (mode === "recovery") return "We could not update your password. Please try again.";
  return mode === "signup" ? "We could not create your account. Check your details and try again." : "We could not log you in. Check your details and try again.";
}

export function AuthForm({ initialMode }: { initialMode: AuthMode }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [panelMode, setPanelMode] = useState<PanelMode>(initialMode);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, signedIn, refresh } = useAuth();
  const destination = safeAuthDestination(searchParams.get("next"));
  const nextSuffix = destination === "/" ? "" : `?next=${encodeURIComponent(destination)}`;
  const callbackError = searchParams.get("error") === "auth_callback_failed" ? "Google sign-in could not be completed. Please try again." : "";
  const mode: PanelMode = searchParams.get("mode") === "recovery" ? "recovery" : panelMode;

  useEffect(() => {
    if (mode !== "recovery" && !loading && signedIn) router.replace(destination);
  }, [destination, loading, mode, router, signedIn]);

  const finishAuthentication = async (message: string) => {
    await refresh();
    toast.success(message);
    router.replace(destination);
    router.refresh();
  };

  const failUnavailable = () => {
    const message = "Sign-in is temporarily unavailable. Please try again.";
    setErrorMessage(message);
    setErrorCode("unavailable");
    toast.error(message);
  };

  const signInWithGoogle = async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return failUnavailable();
    setBusy(true);
    setErrorMessage("");
    setErrorCode("");
    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`;
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callbackUrl } });
    if (error) {
      console.error("[Vaada Auth] Google OAuth start failed", { code: error.code, status: error.status });
      setBusy(false);
      const message = "Google sign-in could not be started. Please try again.";
      setErrorMessage(message);
      setErrorCode(error.code ?? "oauth_error");
      toast.error(message);
    }
  };

  const requestPasswordReset = async (event: FormEvent) => {
    event.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return failUnavailable();
    setBusy(true);
    setErrorMessage("");
    setErrorCode("");
    const recoveryUrl = new URL("/login", window.location.origin);
    recoveryUrl.searchParams.set("mode", "recovery");
    if (destination !== "/") recoveryUrl.searchParams.set("next", destination);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: recoveryUrl.toString() });
    setBusy(false);
    if (error) {
      console.error("[Vaada Auth] password reset request failed", { code: error.code, status: error.status });
      const message = friendlyAuthError(error, "forgot");
      setErrorCode(authErrorCode(error));
      setErrorMessage(message);
      return toast.error(message);
    }
    toast.success("Password reset instructions were sent if that email has an account.");
    setPanelMode("login");
  };

  const updatePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmedPassword) {
      setErrorCode("password_mismatch");
      setErrorMessage("The two passwords do not match.");
      return;
    }
    const supabase = getBrowserSupabase();
    if (!supabase) return failUnavailable();
    setBusy(true);
    setErrorMessage("");
    setErrorCode("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error("[Vaada Auth] password update failed", { code: error.code, status: error.status });
      const message = friendlyAuthError(error, "recovery");
      setErrorCode(authErrorCode(error));
      setErrorMessage(message);
      setBusy(false);
      return toast.error(message);
    }
    await finishAuthentication("Your password has been updated.");
    setBusy(false);
  };

  const authenticate = async (event: FormEvent) => {
    event.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return failUnavailable();
    setBusy(true);
    setErrorMessage("");
    setErrorCode("");
    try {
      if (initialMode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() } } });
        if (error) throw error;
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) throw { code: "user_already_exists" };
        if (!data.session) throw { code: "instant_signup_session_missing" };
        await finishAuthentication("Account created. You are logged in.");
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      if (!data.session) throw { code: "invalid_credentials" };
      await finishAuthentication("You are logged in.");
    } catch (error) {
      const code = authErrorCode(error);
      console.error("[Vaada Auth] authentication failed", { mode: initialMode, code });
      const message = friendlyAuthError(error, initialMode);
      setErrorCode(code);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return <section className={styles.authPage}>
    <div className={styles.authTopbar}><VaadaLogo className={styles.logo} tagline tone="dark" /></div>
    <div className={styles.authPanel}>
      <div className={styles.heading}><h1>{mode === "signup" ? "Create account" : mode === "forgot" ? "Reset password" : mode === "recovery" ? "Choose a new password" : "Log in"}</h1></div>
      {(mode === "login" || mode === "signup") && <nav className={styles.modeTabs} aria-label="Account access">
        <Link className={mode === "login" ? styles.activeTab : ""} href={`/login${nextSuffix}`}>Log in</Link>
        <Link className={mode === "signup" ? styles.activeTab : ""} href={`/signup${nextSuffix}`}>Create account</Link>
      </nav>}
      {(mode === "login" || mode === "signup") && <><button type="button" className={styles.googleButton} onClick={signInWithGoogle} disabled={busy}><GoogleMark /><span>Continue with Google</span></button><div className={styles.divider}><span>or use email</span></div></>}
      {mode === "forgot" && <form className={styles.form} onSubmit={requestPasswordReset}>
        {errorMessage && <p className={styles.error} role="alert">{errorMessage}</p>}
        <p className={styles.guidance}>Enter the email used for your Vaada account. We will send a secure password-reset link.</p>
        <label className={styles.field}>Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <button className={styles.primaryButton} disabled={busy}>{busy ? "Sending" : "Send reset link"}</button>
        <button className={styles.textButton} type="button" onClick={() => { setPanelMode("login"); setErrorMessage(""); setErrorCode(""); }}>Back to log in</button>
      </form>}
      {mode === "recovery" && <form className={styles.form} onSubmit={updatePassword}>
        {errorMessage && <p className={styles.error} role="alert">{errorMessage}</p>}
        <PasswordField value={password} onChange={setPassword} autoComplete="new-password" label="New password" />
        <PasswordField value={confirmedPassword} onChange={setConfirmedPassword} autoComplete="new-password" label="Confirm new password" />
        <button className={styles.primaryButton} disabled={busy}>{busy ? "Updating" : "Update password"}</button>
      </form>}
      {(mode === "login" || mode === "signup") && <form className={styles.form} onSubmit={authenticate}>
        {(errorMessage || callbackError) && <p className={styles.error} role="alert">{errorMessage || callbackError}</p>}
        {errorCode === "invalid_credentials" && <Link className={styles.accountHint} href={`/signup${nextSuffix}`}>New to Vaada? Create an account</Link>}
        {(errorCode === "user_already_exists" || errorCode === "user_already_registered" || errorCode === "email_exists") && <Link className={styles.accountHint} href={`/login${nextSuffix}`}>Use this email to log in</Link>}
        {mode === "signup" && <label className={styles.field}>Full name<input type="text" autoComplete="name" required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} /></label>}
        <label className={styles.field}>Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <PasswordField value={password} onChange={setPassword} autoComplete={mode === "login" ? "current-password" : "new-password"} />
        {mode === "login" && <button className={styles.forgotButton} type="button" onClick={() => { setPanelMode("forgot"); setErrorMessage(""); setErrorCode(""); }}>Forgot password?</button>}
        <button className={styles.primaryButton} disabled={busy}>{busy ? "Please wait" : mode === "signup" ? "Create account" : "Log in"}</button>
      </form>}
    </div>
  </section>;
}
