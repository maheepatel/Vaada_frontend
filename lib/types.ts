export type CommitmentStatus =
  | "unanswered"
  | "promised"
  | "in_progress"
  | "fulfilled"
  | "broken"
  | "disputed";

export type UrgencyBand =
  | "kept"
  | "fresh"
  | "soon"
  | "urgent"
  | "critical"
  | "broken"
  | "disputed"
  | "undated"
  | "unanswered";

export type EvidenceVerdict = "pending" | "verified" | "rejected" | "contested";

export interface EvidenceItem {
  id: string;
  kind: "receipt" | "proof";
  title: string;
  sourceKind: "signed_document" | "media" | "press_link" | "document_link" | "link_only";
  sourceUrl: string;
  storagePath?: string;
  mediaType?: string;
  quote?: string;
  direction?: "supports" | "refutes";
  verdict: EvidenceVerdict;
  documentDate: string;
  reviewedAt?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  detail: string;
  type: "promise" | "evidence" | "status" | "correction";
}

export interface Commitment {
  id: string;
  slug: string;
  title: string;
  detail: string;
  state: string;
  stateSlug: string;
  district: string;
  districtSlug: string;
  locality?: string;
  category: string;
  status: CommitmentStatus;
  promisedOn: string;
  deadline: string | null;
  deadlineLabel: string | null;
  progress: number;
  beneficiaries: string;
  accountableOffice: string;
  accountablePerson?: string;
  lastReviewedAt: string;
  evidence: EvidenceItem[];
  timeline: TimelineEvent[];
}

export interface ExtractedDraft {
  title: string;
  promiseText: string;
  sourceUrl: string;
  promisedOn: string;
  deadlineLabel: string;
  state: string;
  district: string;
  category: string;
  accountableOffice: string;
  confidence: Record<string, number>;
  warnings: string[];
}

export interface SubmissionPayload extends ExtractedDraft {
  submissionKind: "promise" | "proof";
  targetCommitmentSlug?: string;
  submitterName?: string;
  submitterEmail?: string;
  submitAnonymously: boolean;
  proofPath?: string;
  proofMimeType?: string;
  rawText?: string;
}
