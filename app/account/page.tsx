"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-browser";
import { SiteHeader } from "../../components/site-header";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [identity, setIdentity] = useState(() => getSupabaseBrowser() ? "Checking this device…" : "Demo mode");
  const [message, setMessage] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => { setSignedIn(Boolean(data.user)); setIdentity(data.user?.email ?? (data.user ? "Anonymous citizen" : "Not signed in")); });
  }, []);
  const sendLink = async (event: FormEvent) => {
    event.preventDefault();
    const supabase = getSupabaseBrowser();
    if (!supabase) return setMessage("Add Supabase environment variables first.");
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/account` } });
    setMessage(error?.message ?? "Check your email for the secure sign-in link.");
  };
  const signOut = async () => { const supabase = getSupabaseBrowser(); await supabase?.auth.signOut(); setSignedIn(false); setIdentity("Not signed in"); };
  return <><SiteHeader /><main className="inner-page account-page"><Link className="back-link" href="/my-logs">My logs ↗</Link><p className="eyebrow">IDENTITY</p><h1>Your account.</h1><p className="detail-summary">Current identity: {identity}. You can submit anonymously without exposing your identity publicly.</p>{signedIn ? <div className="account-actions"><Link className="button button-primary" href="/my-logs">View private receipts →</Link><button className="button button-ghost" type="button" onClick={signOut}>Sign out</button></div> : <form className="submission-form account-form" onSubmit={sendLink}><section className="form-block coral-block"><h2>Email me a secure link</h2><label><span>Email address</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><button className="button button-invert" type="submit">Send magic link <span>↗</span></button><Link className="button button-ghost" href="/login">Use password login or sign up</Link>{message && <p role="status">{message}</p>}</section></form>}</main></>;
}
