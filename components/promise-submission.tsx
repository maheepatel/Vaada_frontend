"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { EvidenceUpload } from "@/components/evidence-upload";
import { AttributionChoice } from "@/components/attribution-choice";
import { extractPromiseDraft, submitContribution, uploadEvidence } from "@/lib/submission-api";
import type { ExtractedDraft } from "@/lib/types";

const blank: ExtractedDraft = { title: "", promiseText: "", sourceUrl: "", promisedOn: "", deadlineStart: "", deadlineEnd: "", deadlineLabel: "", state: "", district: "", category: "Governance", accountableOffice: "", confidence: {}, warnings: [] };

export function PromiseSubmission() {
  const { session, profile } = useAuth();
  const [step, setStep] = useState<"source" | "review" | "done">("source");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState(blank);
  const [publiclyNamed, setPubliclyNamed] = useState(Boolean(profile?.preferencesConfiguredAt && profile.defaultSubmitAnonymously === false));
  const [name, setName] = useState(profile?.displayName ?? "");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState("");

  const extract = async (event: FormEvent) => {
    event.preventDefault();
    if (!session) return toast.error("Please log in before recording a promise.");
    if (!sourceUrl && !file) return toast.error("Add the original source link or upload the original document.");
    setBusy(true);
    try {
      const result = await extractPromiseDraft({ sourceUrl, rawText, file, token: session.access_token });
      setDraft({ ...blank, ...result.draft, sourceUrl: result.draft.sourceUrl || sourceUrl });
      setStep("review");
      toast.success(result.mode === "ai" ? "AI draft ready. Check every field." : "Draft ready. Check every field.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The promise source could not be read.");
    } finally { setBusy(false); }
  };

  const update = (key: keyof ExtractedDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!session) return toast.error("Please log in before submitting.");
    setBusy(true);
    try {
      const asset = file ? await uploadEvidence({ file, kind: "promise_source", token: session.access_token }) : null;
      const submission = await submitContribution({ ...draft, sourceUrl: draft.sourceUrl || sourceUrl, submissionKind: "promise", submitterName: publiclyNamed ? name.trim() : undefined, submitAnonymously: !publiclyNamed, mediaAssetId: asset?.id, proofMimeType: file?.type, proofSha256: asset?.sha256, proofSizeBytes: asset?.sizeBytes, proofOriginalName: asset?.originalName, rawText }, session.access_token);
      setReceipt(submission.id);
      setStep("done");
      toast.success("Promise source sent for human review.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The promise could not be submitted.");
    } finally { setBusy(false); }
  };

  return <section className="submit-shell"><div className="submit-intro"><p className="eyebrow">RECORD A PROMISE</p><h1>Share the source.<br /><span>Review the draft.</span></h1><p>Start with the original government letter, public announcement, news report or social post. AI prepares an editable draft; a human reviewer decides whether it enters the register.</p><ol><li className={step === "source" ? "active" : ""}>01 · Promise source</li><li className={step === "review" ? "active" : ""}>02 · Check AI draft</li><li className={step === "done" ? "active" : ""}>03 · Private receipt</li></ol></div>
    <div className="intake-panel">{step === "source" && <form onSubmit={extract}><div className="form-heading"><span>STEP 01 · REQUIRED EVIDENCE</span><h2>What proves the promise was made?</h2><p>Add at least one original source: a public link or an uploaded image/PDF. Pasted text is optional context and cannot replace the source.</p></div><label>Public source link<input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="Government website, news report or public social post" /></label><div className="source-divider"><span>OR</span></div><EvidenceUpload file={file} onChange={setFile} kind="promise" /><label>Exact source text (optional)<textarea rows={7} value={rawText} onChange={(event) => setRawText(event.target.value)} placeholder="Paste exact wording to help extraction. Do not summarize if the original is available." /></label><div className="ai-boundary"><strong>AI DRAFTS</strong><span>Promise wording, dates, location, deadline and responsible office.</span><strong>HUMANS DECIDE</strong><span>AI never publishes a record, verifies truth or changes public progress.</span></div><button className="button button-primary full-form-button" disabled={busy || (!sourceUrl && !file)}>{busy ? "Reading source…" : "Create editable AI draft →"}</button></form>}
    {step === "review" && <form onSubmit={submit}><div className="form-heading"><span>STEP 02 · HUMAN CHECK</span><h2>Check the extracted promise.</h2><p>Compare every field with the original source. Blank fields mean the source did not clearly state them.</p></div><section className="source-cross-check"><div><span>ORIGINAL SOURCE</span><strong>Keep the evidence beside the AI draft while you check it.</strong></div>{(draft.sourceUrl || sourceUrl) && <a href={draft.sourceUrl || sourceUrl} target="_blank" rel="noreferrer">Open original source link ↗</a>}{file && <EvidenceUpload file={file} onChange={setFile} kind="promise" />}</section>{draft.warnings.length > 0 && <div className="warning-box">{draft.warnings.map((warning) => <p key={warning}>! {warning}</p>)}</div>}<label>Short public title<input required minLength={8} value={draft.title} onChange={(event) => update("title", event.target.value)} /></label><label>Exact promise wording<textarea required minLength={20} rows={6} value={draft.promiseText} onChange={(event) => update("promiseText", event.target.value)} /></label><div className="field-pair"><label>State<input required value={draft.state} onChange={(event) => update("state", event.target.value)} /></label><label>District<input value={draft.district} onChange={(event) => update("district", event.target.value)} /></label></div><div className="field-pair"><label>Sector<input required value={draft.category} onChange={(event) => update("category", event.target.value)} /></label><label>Promise date<input type="date" value={draft.promisedOn} onChange={(event) => update("promisedOn", event.target.value)} /></label></div><div className="field-pair"><label>Earliest stated completion<input type="date" value={draft.deadlineStart} onChange={(event) => update("deadlineStart", event.target.value)} /></label><label>Latest stated completion<input type="date" min={draft.deadlineStart || undefined} value={draft.deadlineEnd} onChange={(event) => update("deadlineEnd", event.target.value)} /></label></div><label>Exact timeframe wording (optional)<input value={draft.deadlineLabel} onChange={(event) => update("deadlineLabel", event.target.value)} placeholder="For example, within 24 to 72 hours" /></label><label>Responsible office or person<input value={draft.accountableOffice} onChange={(event) => update("accountableOffice", event.target.value)} /></label><AttributionChoice publiclyNamed={publiclyNamed} name={name} onPubliclyNamedChange={setPubliclyNamed} onNameChange={setName} /><div className="form-actions"><button type="button" className="button button-ghost" onClick={() => setStep("source")}>← Back</button><button className="button button-primary" disabled={busy || (publiclyNamed && name.trim().length < 2)}>{busy ? "Saving securely…" : "Send promise for review →"}</button></div></form>}
    {step === "done" && <div className="success-state"><span>✓</span><p className="eyebrow">PRIVATE RECEIPT</p><h2>Your promise source is in the review queue.</h2><p>Nothing is public yet. A reviewer will compare the draft with the original evidence before deciding.</p><code>{receipt}</code><div><a className="button button-primary" href="/my-logs">View my records →</a><a className="button button-ghost" href="/promises">Explore register</a></div></div>}</div></section>;
}
