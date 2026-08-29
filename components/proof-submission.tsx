"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { EvidenceUpload } from "@/components/evidence-upload";
import { fetchPromiseRecord, submitContribution, uploadEvidence } from "@/lib/submission-api";
import type { Commitment } from "@/lib/types";

const slugFrom = (value: string) => value.trim().replace(/\/$/, "").split("/").pop() ?? "";

export function ProofSubmission({ initialPromise }: { initialPromise: string }) {
  const { session, profile } = useAuth();
  const [target, setTarget] = useState<Commitment | null>(null);
  const [targetError, setTargetError] = useState("");
  const [loadingTarget, setLoadingTarget] = useState(Boolean(initialPromise));
  const [sourceUrl, setSourceUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState("");

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
      const publiclyNamed = Boolean(profile?.preferencesConfiguredAt && profile.defaultSubmitAnonymously === false && profile.displayName?.trim());
      const submission = await submitContribution({ submissionKind: "proof", targetCommitmentSlug: target.slug, title: `Completion proof for ${target.title}`.slice(0, 180), promiseText: `Completion evidence submitted for the public promise: ${target.title}`.slice(0, 10000), sourceUrl, promisedOn: "", deadlineStart: "", deadlineEnd: "", deadlineLabel: "", state: target.state, district: target.district, category: target.category, accountableOffice: target.accountableOffice, confidence: {}, warnings: [], submitterName: publiclyNamed ? profile?.displayName?.trim() : undefined, submitAnonymously: !publiclyNamed, mediaAssetId: asset?.id, proofMimeType: file?.type, proofSha256: asset?.sha256, proofSizeBytes: asset?.sizeBytes, proofOriginalName: asset?.originalName }, session.access_token);
      setReceipt(submission.id);
      toast.success("Completion proof sent for human review.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The proof could not be submitted.");
    } finally { setBusy(false); }
  };

  return <section className="submit-shell proof-submit-shell"><div className="submit-intro"><p className="eyebrow">SUBMIT COMPLETION PROOF</p><h1>Show what<br /><span>was delivered.</span></h1><p>Add a public completion link, an image or a PDF. The proof stays private until a reviewer accepts it.</p><ol><li className={!receipt ? "active" : ""}>01 · Confirm promise</li><li className={!receipt ? "active" : ""}>02 · Add proof</li><li className={receipt ? "active" : ""}>03 · Under review</li></ol></div><div className="intake-panel">{!initialPromise ? <div className="proof-selection-gate"><p className="eyebrow">SELECT A PUBLIC RECORD</p><h2>Open the promise first.</h2><p>Choose the promise that was completed, then use its Submit proof button. This prevents proof from being attached to the wrong record.</p><Link className="button button-primary" href="/promises">Choose a promise →</Link></div> : !receipt ? <form onSubmit={submit}><div className="form-heading"><span>SELECTED PROMISE</span><h2>Confirm the public record.</h2><p>The promise details are loaded automatically from the record you opened.</p></div>{loadingTarget && <div className="record-empty">Loading promise details…</div>}{targetError && <p className="field-error" role="alert">{targetError}</p>}{target && <article className="proof-target-card"><span>{target.state} · {target.district}</span><h3>{target.title}</h3><dl><div><dt>Status</dt><dd>{target.status.replaceAll("_", " ")}</dd></div><div><dt>Progress</dt><dd>{target.progress}%</dd></div><div><dt>Responsible office</dt><dd>{target.accountableOffice}</dd></div></dl></article>}
        <div className="form-heading proof-source-heading"><span>COMPLETION PROOF</span><h2>Add proof of delivery.</h2><p>Provide a link, an upload, or both. Images and PDFs are not analysed by AI in this version.</p></div><label>Public completion link<input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="Official completion update, report or public post" /></label><div className="source-divider"><span>OR</span></div><EvidenceUpload file={file} onChange={setFile} kind="proof" /><div className="human-review-note"><strong>REVIEW REQUIRED</strong><p>The public can see that proof is under review, but the link and file remain private until a reviewer accepts them.</p></div><button className="button button-primary full-form-button" disabled={busy || !target || (!sourceUrl && !file)}>{busy ? "Saving proof…" : "Submit proof →"}</button></form> : <div className="success-state"><span>✓</span><p className="eyebrow">PRIVATE RECEIPT</p><h2>Your completion proof is under review.</h2><p>The public record now shows that proof is awaiting review. The link or file becomes public only if a reviewer accepts it.</p><code>{receipt}</code><div><a className="button button-primary" href="/my-logs">View my records →</a><a className="button button-ghost" href={`/promises/${target?.slug ?? ""}`}>Return to promise</a></div></div>}</div></section>;
}
