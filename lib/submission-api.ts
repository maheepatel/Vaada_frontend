import { backendEndpoint } from "./external-services";
import type { Commitment, ExtractedDraft, SubmissionPayload } from "./types";

async function responseBody(response: Response) {
  try { return await response.json(); } catch { return {}; }
}

async function apiFetch(path: string, init?: RequestInit) {
  const endpoint = backendEndpoint(path);
  if (!endpoint) throw new Error("This service is temporarily unavailable.");
  try { return await fetch(endpoint, init); } catch (error) {
    console.error("[Vaada API] request failed", { path, method: init?.method ?? "GET", error: error instanceof Error ? error.message : "network error" });
    throw new Error("Vaada could not reach the service. Please try again.");
  }
}

export async function fetchPromiseRecord(slug: string): Promise<Commitment> {
  const response = await apiFetch(`/v1/promises/${encodeURIComponent(slug)}`);
  const body = await responseBody(response);
  if (!response.ok || !body.commitment) throw new Error(body.error ?? "Promise details could not be loaded.");
  return body.commitment;
}

export async function extractPromiseDraft(input: { sourceUrl: string; rawText: string; file: File | null; token: string }): Promise<{ draft: ExtractedDraft; mode: "ai" | "heuristic" }> {
  const form = new FormData();
  form.set("sourceUrl", input.sourceUrl);
  form.set("rawText", input.rawText);
  if (input.file) form.set("file", input.file);
  const response = await apiFetch("/v1/extract", { method: "POST", headers: { authorization: `Bearer ${input.token}` }, body: form });
  const body = await responseBody(response);
  if (!response.ok) {
    // Surface the real backend error instead of guessing a cause — the service has
    // returned the same generic schema error for Twitter links, plain news articles
    // and images alike, so mapping it to "source type not supported" was misleading.
    const errorMsg = body.error ?? "The promise source could not be read.";
    console.error("[Vaada API] extraction failed", errorMsg);
    throw new Error(`${errorMsg} You can still continue and fill in the details yourself.`);
  }
  return body;
}

export async function uploadEvidence(input: { file: File; kind: "promise_source" | "completion_proof"; token: string }) {
  const form = new FormData();
  form.set("file", input.file);
  form.set("kind", input.kind);
  const response = await apiFetch("/v1/uploads/proof", { method: "POST", headers: { authorization: `Bearer ${input.token}` }, body: form });
  const body = await responseBody(response);
  if (!response.ok || !body.asset?.id) {
    const rawError = body.error ?? "The evidence file could not be saved.";
    console.error("[Vaada API] upload failed", rawError);
    // A Postgres "permission denied" here is a server-side RLS/grant problem on the
    // media_assets table, not something wrong with the file or the user's action.
    if (/permission denied/i.test(rawError)) {
      throw new Error("The server could not save this file because of a database permissions problem on its end. This is not something wrong with your file — please try again later or contact support.");
    }
    throw new Error(rawError);
  }
  return body.asset as { id: string; sha256: string; sizeBytes: number; originalName: string };
}

export async function submitContribution(payload: SubmissionPayload, token: string) {
  const response = await apiFetch("/v1/submissions", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  const body = await responseBody(response);
  if (!response.ok || !body.submission?.id) throw new Error(body.error ?? "The contribution could not be submitted.");
  return body.submission as { id: string; status: string; created_at: string };
}
