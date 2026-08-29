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
    const errorMsg = body.error ?? "The promise source could not be read.";
    if (errorMsg.includes("additionalProperties") || errorMsg.includes("strict Structured Outputs")) {
      throw new Error("This source type (e.g., Twitter/X) is not yet supported. Please use a direct article link instead.");
    }
    throw new Error(errorMsg);
  }
  return body;
}

export async function uploadEvidence(input: { file: File; kind: "promise_source" | "completion_proof"; token: string }) {
  const form = new FormData();
  form.set("file", input.file);
  form.set("kind", input.kind);
  const response = await apiFetch("/v1/uploads/proof", { method: "POST", headers: { authorization: `Bearer ${input.token}` }, body: form });
  const body = await responseBody(response);
  if (!response.ok || !body.asset?.id) throw new Error(body.error ?? "The evidence file could not be saved.");
  return body.asset as { id: string; sha256: string; sizeBytes: number; originalName: string };
}

export async function submitContribution(payload: SubmissionPayload, token: string) {
  const response = await apiFetch("/v1/submissions", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  const body = await responseBody(response);
  if (!response.ok || !body.submission?.id) throw new Error(body.error ?? "The contribution could not be submitted.");
  return body.submission as { id: string; status: string; created_at: string };
}
