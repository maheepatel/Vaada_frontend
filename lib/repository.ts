import { commitments as seedCommitments, getCommitmentBySlug as getSeedBySlug } from "./seed";
import { backendEndpoint } from "./external-services";
import type { Commitment } from "./types";

export async function listCommitments(): Promise<Commitment[]> {
  const endpoint = backendEndpoint("/v1/promises");
  if (!endpoint) return seedCommitments;
  try {
    const response = await fetch(endpoint, { next: { revalidate: 60 } });
    if (!response.ok) return seedCommitments;
    const body = await response.json() as { commitments?: Commitment[] };
    return body.commitments?.length ? body.commitments : seedCommitments;
  } catch {
    return seedCommitments;
  }
}

export async function getCommitmentBySlug(slug: string): Promise<Commitment | undefined> {
  const endpoint = backendEndpoint(`/v1/promises/${encodeURIComponent(slug)}`);
  if (!endpoint) return getSeedBySlug(slug);
  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) return getSeedBySlug(slug);
    const body = await response.json() as { commitment?: Commitment };
    return body.commitment ?? getSeedBySlug(slug);
  } catch {
    return getSeedBySlug(slug);
  }
}
