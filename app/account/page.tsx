"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { type AccountProfile, type ContributorType, useAuth } from "@/components/auth-provider";
import { AuthGuard, ProtectedActionLink } from "@/components/protected-action";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { backendEndpoint } from "@/lib/external-services";

function AccountSettings({ initialProfile }: { initialProfile: AccountProfile }) {
  const { user, role, session, refresh } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialProfile.displayName);
  const preferencesConfigured = Boolean(initialProfile.preferencesConfiguredAt);
  const [contributorType, setContributorType] = useState<ContributorType | null>(preferencesConfigured ? initialProfile.contributorType : null);
  const [defaultAnonymous, setDefaultAnonymous] = useState<boolean | null>(preferencesConfigured ? initialProfile.defaultSubmitAnonymously : null);
  const [saving, setSaving] = useState(false);
  const provider = user?.app_metadata?.provider === "google" ? "Google" : "Email and password";
  const dirty = displayName.trim() !== initialProfile.displayName || !preferencesConfigured || contributorType !== initialProfile.contributorType || defaultAnonymous !== initialProfile.defaultSubmitAnonymously;
  const permission = useMemo(() => role === "admin" ? "Administrator" : role === "reviewer" ? "Approved reviewer" : "Contributor", [role]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!session) return toast.error("Log in again to save these settings.");
    if (!contributorType || defaultAnonymous === null) return toast.error("Choose your contributor type and public credit default.");
    if (!defaultAnonymous && displayName.trim().length < 2) return toast.error("Add a display name before enabling public credit.");
    const endpoint = backendEndpoint("/v1/me/profile");
    if (!endpoint) return toast.error("Account settings are temporarily unavailable.");
    setSaving(true);
    try {
      const response = await fetch(endpoint, { method: "PATCH", headers: { "content-type": "application/json", authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ displayName: displayName.trim(), contributorType, defaultSubmitAnonymously: defaultAnonymous }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Account settings could not be saved.");
      await refresh();
      toast.success("Account preferences saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Account settings could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    const supabase = getBrowserSupabase();
    const { error } = await supabase?.auth.signOut() ?? { error: null };
    if (error) return toast.error(error.message);
    toast.success("Signed out securely.");
    router.replace("/");
  };

  return <section className="account-page secure-account-page">
    <header className="account-heading"><div><p className="eyebrow">YOUR VAADA ACCOUNT</p><h1>Account<br /><span>settings.</span></h1></div><p>Manage how you contribute and how your name appears. Your login email and permission level stay protected.</p></header>
    <div className="account-dashboard">
      <form className="account-settings-card" onSubmit={save}>
        <div className="account-section-heading"><span>01</span><div><p className="eyebrow">PROFILE</p><h2>Your identity</h2><p>This information is private unless you choose public credit for a contribution.</p></div></div>
        <div className="account-field-grid"><label>Display name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={120} placeholder="How should Vaada credit you?" /></label><label>Email address<input value={user?.email ?? ""} readOnly aria-readonly="true" /></label></div>
        <dl className="account-facts"><div><dt>Signed in with</dt><dd>{provider}</dd></div><div><dt>Permission</dt><dd>{permission}</dd><small>Reviewer and admin access is assigned by Vaada, not selected here.</small></div></dl>

        <div className="account-section-heading"><span>02</span><div><p className="eyebrow">CONTRIBUTOR TYPE</p><h2>How are you contributing?</h2><p>This is self-described context for reviewers. It never grants official verification or reviewer access.</p></div></div>
        <div className="account-choice-grid" role="radiogroup" aria-label="Contributor type"><label className={contributorType === "citizen" ? "selected" : ""}><input type="radio" name="contributorType" checked={contributorType === "citizen"} onChange={() => setContributorType("citizen")} /><span><strong>Citizen</strong><small>I am sharing a public source or evidence as a member of the public.</small></span></label><label className={contributorType === "government_official" ? "selected" : ""}><input type="radio" name="contributorType" checked={contributorType === "government_official"} onChange={() => setContributorType("government_official")} /><span><strong>Government official</strong><small>I am submitting in an official capacity. Vaada may still request verification.</small></span></label><label className={contributorType === "news_reporter" ? "selected" : ""}><input type="radio" name="contributorType" checked={contributorType === "news_reporter"} onChange={() => setContributorType("news_reporter")} /><span><strong>News reporter</strong><small>I report public announcements and can submit first-hand source material for review.</small></span></label></div>{!preferencesConfigured && contributorType === null && <p className="account-choice-prompt">Choose one. Vaada has not selected this for you.</p>}

        <div className="account-section-heading"><span>03</span><div><p className="eyebrow">PUBLIC CREDIT DEFAULT</p><h2>Choose your default</h2><p>This saved choice is used for completion proof. You can still override it while recording a new promise.</p></div></div>
        <div className="account-choice-grid" role="radiogroup" aria-label="Public credit default"><label className={defaultAnonymous === true ? "selected" : ""}><input type="radio" name="privacy" checked={defaultAnonymous === true} onChange={() => setDefaultAnonymous(true)} /><span><strong>Keep my name private</strong><small>Vaada keeps your account in the private audit trail but does not publish your identity.</small></span></label><label className={defaultAnonymous === false ? "selected" : ""}><input type="radio" name="privacy" checked={defaultAnonymous === false} onChange={() => setDefaultAnonymous(false)} /><span><strong>Credit my display name</strong><small>Your display name may appear after a reviewer accepts the contribution. Your email is never public.</small></span></label></div>{!preferencesConfigured && defaultAnonymous === null && <p className="account-choice-prompt">Choose one. Until you save a preference, each new contribution stays private by default.</p>}

        <div className="account-save-row"><p>{!preferencesConfigured ? "Complete both choices to save your account preferences." : dirty ? "You have unsaved changes." : "Your saved preferences are up to date."}</p><button className="button button-primary" disabled={saving || !dirty || !contributorType || defaultAnonymous === null}>{saving ? "Saving…" : "Save settings"}</button></div>
      </form>
      <aside className="account-sidebar"><div><p className="eyebrow">QUICK ACTIONS</p><ProtectedActionLink href="/my-logs">My records <span>→</span></ProtectedActionLink><ProtectedActionLink href="/submit">Record a promise <span>＋</span></ProtectedActionLink><ProtectedActionLink href="/submit-proof">Submit completion proof <span>✓</span></ProtectedActionLink>{role && ["reviewer","admin"].includes(role) && <ProtectedActionLink href="/review" roles={["reviewer","admin"]}>Review queue <span>→</span></ProtectedActionLink>}</div><button type="button" onClick={signOut}>Sign out</button></aside>
    </div>
  </section>;
}

export default function AccountPage() {
  const { profile } = useAuth();
  return <main className="site-shell route-shell"><SiteHeader /><AuthGuard>{profile && <AccountSettings key={`${profile.updatedAt ?? "initial"}-${profile.contributorType}-${profile.defaultSubmitAnonymously}`} initialProfile={profile} />}</AuthGuard><SiteFooter /></main>;
}
