import type { Commitment } from "./types";

export const promiseStages = ["Logged", "Progress", "Work started", "Completed"] as const;

export function promiseStage(item: Commitment) {
  if (item.status === "fulfilled") return 3;
  if (["in_progress", "broken", "disputed"].includes(item.status)) return item.progress >= 25 ? 2 : 1;
  return 0;
}

export function hasAcceptedProof(item: Commitment) {
  return item.evidence.some((entry) => entry.kind === "proof" && entry.verdict !== "rejected");
}

export function formatPublicDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`))
    : "Not stated";
}
