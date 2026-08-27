import type { EvidenceItem } from "./types";
import { backendEndpoint } from "./external-services";

export function evidenceHref(item: EvidenceItem) {
  return item.hasMedia ? backendEndpoint(`/v1/evidence/${item.id}/file`) || item.sourceUrl : item.sourceUrl;
}

export function isImageEvidence(item: EvidenceItem) {
  return Boolean(item.hasMedia && item.mediaType?.startsWith("image/"));
}
