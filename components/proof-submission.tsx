"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { EvidenceUpload } from "@/components/evidence-upload";
import { AttributionChoice } from "@/components/attribution-choice";
import { fetchPromiseRecord, submitContribution, uploadEvidence } from "@/lib/submission-api";
import type { Commitment } from "@/lib/types";

const slugFrom = (value: string) => value.trim().replace(/\/$/, "").split("/").pop() ?? "";

export function ProofSubmission({ initialPromise }: { initialPromise: string }) {
  const { session, profile } = useAuth();
  const [targetInput, setTargetInput] = useState(initialPromise);
  const [target, setTarget] = useState<Commitment | null>(null);
  const [targetError, setTargetError] = useState("");
  const [loadingTarget, setLoadingTarget] = useState(Boolean(initialPromise));
  const [sourceUrl, setSourceUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceDate, setEvidenceDate] = useState("");
  const [publiclyNamed, setPubliclyNamed] = useState(Boolean(profile?.preferencesConfiguredAt && profile.defaultSubmitAnonymously === false));
  const [name, setName] = useState(profile?.displayName ?? "");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState("");

  const loadTarget = useCallback(async (value: string) => {
    const slug = slugFrom(value);
    if (!slug) { setTarget(null); setTargetError("Paste a Vaada promise link or ID."); return; }
    setLoadingTarget(true); setTargetError("");
    try { setTarget(await fetchPromiseRecord(slug)); }
    catch (error) { setTarget(null); setTargetError(error instanceof Error ? error.message : "Promise details could not be loaded."); }
    finally { setLoadingTarget(false); }
  }, []);

  useEffect(() => {
    if (!initialPromise) return;
    let cancelled = false;
    void fetchPromiseRecord(slugFrom(initialPromise))
      .then((record) => { if (!cancelled) setTarget(record); })
      .catch((error) => { if (!cancelled) setTargetError(error instanceof Error ? error.message : "Promise details could not be loaded."); })
      .finally(() => { if (!cancelled) setLoadingTarget(false); });
    return () => { cancelled = true; };
  }, [initialPromise]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!session) return toast.error("Please log in before submitting proof.");
    if (!target) return toast.error("Load the promise this proof belongs to.");
    if (!sourceUrl && !file) return toast.error("Add a completion link or upload an image/PDF.");
    setBusy(true);
    try {
      const asset = file ? await uploadEvidence({ file, kind: "completion_proof", token: session.access_token }) : null;
      const submission = await submitContribution({ submissionKind: "proof", targetCommitmentSlug: target.slug, title, promiseText: description, sourceUrl, promisedOn: evidenceDate, deadlineStart: "", deadlineEnd: "", deadlineLabel: "", state: target.state, district: target.district, category: target.category, accountableOffice: target.accountableOffice, confidence: {}, warnings: [], submitterName: publiclyNamed ? name.trim() : undefined, submitAnonymously: !publiclyNamed, mediaAssetId: asset?.id, proofMimeType: file?.type, proofSha256: asset?.sha256, proofSizeBytes: asset?.sizeBytes, proofOriginalName: asset?.originalName }, session.access_token);
      setReceipt(submission.id);
      toast.success("Completion proof sent for human review.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The proof could not be submitted.");
    } finally { setBusy(false); }
  };

  return <section className="submit-shell proof-submit-shell"><div className="submit-intro"><p className="eyebrow">SUBMIT COMPLETION PROOF</p><h1>Show what<br /><span>was delivered.</span></h1><p>This route is only for evidence that an open promise was completed or materially delivered. There is no AI analysis of uploaded proof in this version; every submission goes to a human reviewer.</p><ol><li className={!receipt ? "active" : ""}>01 · Match an open promise</li><li className={!receipt ? "active" : ""}>02 · Add completion proof</li><li className={receipt ? "active" : ""}>03 · Private receipt</li></ol></div><div className="intake-panel">{!receipt ? <form onSubmit={submit}><div className="form-heading"><span>STEP 01 · PROMISE MATCH</span><h2>Which promise was completed?</h2><p>Paste the Vaada record link or promise ID. We load the public record before accepting evidence.</p></div><div className="target-loader"><label>Vaada promise link or ID<input required value={targetInput} onChange={(event) => setTargetInput(event.target.value)} placeholder="rajasthan-50-digital-classrooms" /></label><button type="button" onClick={() => void loadTarget(targetInput)} disabled={loadingTarget}>{loadingTarget ? "Loading…" : "Load promise"}</button></div>{targetError && <p className="field-error" role="alert">{targetError}</p>}{target && <article className="proof-target-card"><span>{target.state} · {target.district}</span><h3>{target.title}</h3><dl><div><dt>Status</dt><dd>{target.status.replaceAll("_", " ")}</dd></div><div><dt>Progress</dt><dd>{target.progress}%</dd></div><div><dt>Responsible office</dt><dd>{target.accountableOffice}</dd></div></dl></article>}
        <div className="form-heading proof-source-heading"><span>STEP 02 · COMPLETION EVIDENCE</span><h2>Add proof of delivery.</h2><p>Provide at least one link or upload. Link-only submissions receive a basic relevance check against the selected promise and completion language. Images and PDFs are not analysed by AI in this version.</p></div><label>Public completion link<input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="Official completion update, report or public post" /></label><div className="source-divider"><span>OR</span></div><EvidenceUpload file={file} onChange={setFile} kind="proof" /><label>Evidence title<input required minLength={8} maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="For example, 50 digital classrooms inaugurated" /></label><label>What does this proof show?<textarea required minLength={20} rows={6} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the delivered work and how it matches the selected promise." /></label><label>Evidence date<input required type="date" value={evidenceDate} onChange={(event) => setEvidenceDate(event.target.value)} /></label><div className="human-review-note"><strong>HUMAN REVIEW ONLY</strong><p>Uploading proof does not complete a promise automatically. A reviewer checks the source, scope and selected record before progress changes.</p></div><AttributionChoice publiclyNamed={publiclyNamed} name={name} onPubliclyNamedChange={setPubliclyNamed} onNameChange={setName} /><button className="button button-primary full-form-button" disabled={busy || !target || (!sourceUrl && !file) || (publiclyNamed && name.trim().length < 2)}>{busy ? "Saving proof…" : "Send proof for human review →"}</button></form> : <div className="success-state"><span>✓</span><p className="eyebrow">PRIVATE RECEIPT</p><h2>Your completion proof is in the review queue.</h2><p>The selected promise has not changed yet. A reviewer must accept the evidence before public progress is updated.</p><code>{receipt}</code><div><a className="button button-primary" href="/my-logs">View my records →</a><a className="button button-ghost" href={`/promises/${target?.slug ?? ""}`}>Return to promise</a></div></div>}</div></section>;
}
