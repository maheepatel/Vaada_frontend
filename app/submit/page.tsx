"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { backendEndpoint } from "@/lib/external-services";
import type { ExtractedDraft } from "@/lib/types";

const blank: ExtractedDraft = { title: "", promiseText: "", sourceUrl: "", promisedOn: "", deadlineStart: "", deadlineEnd: "", deadlineLabel: "", state: "", district: "", category: "Governance", accountableOffice: "", confidence: {}, warnings: [] };
const targetSlugFrom = (value: string) => value.trim().replace(/\/$/, "").split("/").pop() ?? "";

export default function SubmitPage() {
  const [step, setStep] = useState<"source" | "review" | "done">("source");
  const [mode, setMode] = useState<"promise" | "proof">("promise");
  const [targetCommitment, setTargetCommitment] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState(blank);
  const [anonymous, setAnonymous] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState("");
  const isProof = mode === "proof";
  const extractionEndpoint = backendEndpoint("/v1/extract");
  const extractionReady = Boolean(extractionEndpoint);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const query = new URLSearchParams(window.location.search);
      setMode(query.get("mode") === "proof" ? "proof" : "promise");
      setTargetCommitment(query.get("promise") ?? "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const extract = async (event: FormEvent) => {
    event.preventDefault();
    if (isProof && !targetSlugFrom(targetCommitment)) return toast.error("Choose the promise this proof belongs to.");
    setBusy(true);
    try {
      const form = new FormData();
      form.set("sourceUrl", sourceUrl);
      form.set("rawText", rawText);
      if (file) form.set("file", file);
      if (!extractionEndpoint) throw new Error("The Vaada backend URL is not configured.");
      const response = await fetch(extractionEndpoint, { method: "POST", body: form });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setDraft({ ...blank, ...body.draft });
      setStep("review");
      toast.success(body.mode === "ai" ? "AI draft ready. Check every field." : "Draft ready. Check every field.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read this source.");
    } finally { setBusy(false); }
  };

  const update = (key: keyof ExtractedDraft, value: string) => setDraft((old) => ({ ...old, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return toast.error("Secure submission storage is not connected in this preview.");
    setBusy(true);
    try {
      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const signed = await supabase.auth.signInAnonymously();
        if (signed.error) throw signed.error;
        session = signed.data.session;
      }
      let proofPath: string | undefined;
      if (file && session) {
        const uploadEndpoint = backendEndpoint("/v1/uploads/proof");
        if (!uploadEndpoint) throw new Error("The Vaada backend URL is not configured.");
        const upload = new FormData();
        upload.set("file", file);
        const uploaded = await fetch(uploadEndpoint, { method: "POST", headers: { authorization: `Bearer ${session.access_token}` }, body: upload });
        const uploadedBody = await uploaded.json();
        if (!uploaded.ok) throw new Error(uploadedBody.error ?? "The proof upload could not be saved.");
        proofPath = uploadedBody.proofPath;
      }
      const endpoint = backendEndpoint("/v1/submissions");
      if (!endpoint) throw new Error("The Vaada backend URL is not configured.");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ ...draft, submitterName: name, submitterEmail: email, submitAnonymously: anonymous, proofPath, proofMimeType: file?.type, rawText, submissionKind: mode, targetCommitmentSlug: isProof ? targetSlugFrom(targetCommitment) : undefined }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setReceipt(body.submission.id);
      setStep("done");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submission failed.");
    } finally { setBusy(false); }
  };

  return <main className="site-shell route-shell"><SiteHeader /><section className="submit-shell"><div className="submit-intro"><p className="eyebrow">{isProof ? "PUBLIC PROOF INTAKE" : "SIMPLE INTAKE"}</p><h1>{isProof ? <>Show what<br /><span>changed.</span></> : <>Share the source.<br /><span>We draft the rest.</span></>}</h1><p>{isProof ? "Upload a completion photo, signed government letter, public update or social post. AI reads it; a human decides whether the promise moves." : "Paste the public text and link, or attach a government letter. The assistant extracts editable fields; no AI output goes public without human review."}</p><ol><li className={step === "source" ? "active" : ""}>01 · Source</li><li className={step === "review" ? "active" : ""}>02 · Check draft</li><li className={step === "done" ? "active" : ""}>03 · Receipt</li></ol></div>
    <div className="intake-panel">{step === "source" && <form onSubmit={extract}><div className="form-heading"><span>STEP 01 · {isProof ? "PROOF" : "PROMISE"}</span><h2>{isProof ? "What proves progress?" : "What did you see?"}</h2></div>{isProof && <label>Promise record link or ID<input required value={targetCommitment} onChange={(event) => setTargetCommitment(event.target.value)} placeholder="Paste the Vaada record link or promise ID" /></label>}<label>{isProof ? "Public proof or Twitter/X link" : "Public source or Twitter/X link"}<input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://x.com/... or government website" /></label><label>{isProof ? "Paste the progress update or letter text" : "Paste the announcement or extracted document text"}<textarea rows={9} value={rawText} onChange={(event) => setRawText(event.target.value)} placeholder="Paste the exact wording here. Do not summarize if you can copy the original." /></label><label className="file-drop">{isProof ? "Completion image, signed letter or PDF" : "Original image or PDF"}<input type="file" accept="image/*,.pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /><span>{file ? file.name : "Choose a file"}</span></label><div className="ai-boundary"><strong>AI CAN</strong><span>Read public links, screenshots and PDFs; extract names, dates, places and stated outcomes.</span><strong>AI CANNOT</strong><span>Publish, verify truth, close a promise, or change public progress.</span></div>{!extractionReady && <p className="setup-notice" role="status">Backend connection required: set NEXT_PUBLIC_VAADA_API_URL before testing AI extraction or proof submission.</p>}<button className="button button-primary" disabled={!extractionReady || busy || (!sourceUrl && !rawText && !file)}>{busy ? "Reading source…" : extractionReady ? "Create editable draft →" : "Connect backend to continue"}</button></form>}
    {step === "review" && <form onSubmit={submit}><div className="form-heading"><span>STEP 02 · HUMAN CHECK</span><h2>{isProof ? "Check the evidence draft." : "Check the promise draft."}</h2><p>Blank or uncertain fields are intentional. The reviewer will always inspect the original source.</p></div>{draft.warnings.length > 0 && <div className="warning-box">{draft.warnings.map((warning) => <p key={warning}>! {warning}</p>)}</div>}<label>{isProof ? "Short evidence title" : "Short public title"}<input required value={draft.title} onChange={(event) => update("title", event.target.value)} /></label><label>{isProof ? "What does this evidence show?" : "Exact promise wording"}<textarea required minLength={20} rows={6} value={draft.promiseText} onChange={(event) => update("promiseText", event.target.value)} /></label>{!isProof && <><div className="field-pair"><label>State<input required value={draft.state} onChange={(event) => update("state", event.target.value)} /></label><label>District<input value={draft.district} onChange={(event) => update("district", event.target.value)} /></label></div><div className="field-pair"><label>Sector<input required value={draft.category} onChange={(event) => update("category", event.target.value)} /></label><label>Promise date<input type="date" value={draft.promisedOn} onChange={(event) => update("promisedOn", event.target.value)} /></label></div><div className="field-pair"><label>Earliest stated completion<input type="date" value={draft.deadlineStart} onChange={(event) => update("deadlineStart", event.target.value)} /></label><label>Latest stated completion<input type="date" min={draft.deadlineStart || undefined} value={draft.deadlineEnd} onChange={(event) => update("deadlineEnd", event.target.value)} /></label></div><label>Exact timeframe wording (leave blank if absent)<input value={draft.deadlineLabel} onChange={(event) => update("deadlineLabel", event.target.value)} placeholder="For example, within 24 to 72 hours" /></label><label>Responsible office or person<input value={draft.accountableOffice} onChange={(event) => update("accountableOffice", event.target.value)} /></label></>}{isProof && <label>Evidence date<input type="date" value={draft.promisedOn} onChange={(event) => update("promisedOn", event.target.value)} /></label>}<fieldset><legend>How should this submission be credited?</legend><label className="choice"><input type="radio" checked={anonymous} onChange={() => setAnonymous(true)} /> Submit anonymously</label><label className="choice"><input type="radio" checked={!anonymous} onChange={() => setAnonymous(false)} /> Add my name privately</label>{!anonymous && <div className="field-pair"><label>Name<input required value={name} onChange={(event) => setName(event.target.value)} /></label><label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label></div>}</fieldset>{!isSupabaseConfigured && <p className="setup-notice">Preview mode: browsing and AI assisted drafting work now. Connect Supabase variables to enable secure uploads and final submission.</p>}<div className="form-actions"><button type="button" className="button button-ghost" onClick={() => setStep("source")}>← Back</button><button className="button button-primary" disabled={busy}>{busy ? "Saving securely…" : "Send for human review →"}</button></div></form>}
    {step === "done" && <div className="success-state"><span>✓</span><p className="eyebrow">PRIVATE RECEIPT</p><h2>{isProof ? "Your proof is in the review queue." : "Your source is in the review queue."}</h2><p>Nothing changes publicly yet. Save this receipt to follow the decision without exposing your identity.</p><code>{receipt}</code><div><a className="button button-primary" href="/my-logs">View my logs →</a><a className="button button-ghost" href="/promises">Explore register</a></div></div>}</div></section></main>;
}
