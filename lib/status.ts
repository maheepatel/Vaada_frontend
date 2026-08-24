import type { Commitment, UrgencyBand } from "./types";

const MS_PER_DAY = 86_400_000;

export function deriveUrgency(commitment: Commitment, now: Date): UrgencyBand {
  if (commitment.status === "fulfilled") return "kept";
  if (commitment.status === "disputed") return "disputed";
  if (commitment.status === "unanswered") return "unanswered";
  if (!commitment.deadline) return "undated";

  const deadline = new Date(`${commitment.deadline}T23:59:59Z`);
  if (deadline.getTime() < now.getTime()) return "broken";

  const promised = new Date(`${commitment.promisedOn}T00:00:00Z`);
  const window = Math.max(deadline.getTime() - promised.getTime(), MS_PER_DAY);
  const elapsed = Math.max(now.getTime() - promised.getTime(), 0) / window;
  if (elapsed >= 0.95) return "critical";
  if (elapsed >= 0.8) return "urgent";
  if (elapsed >= 0.55) return "soon";
  return "fresh";
}

export function publicStatusLabel(status: Commitment["status"]): string {
  return ({
    unanswered: "Unanswered",
    promised: "Waiting",
    in_progress: "In progress",
    fulfilled: "Promise kept",
    broken: "Late",
    disputed: "Disputed",
  } satisfies Record<Commitment["status"], string>)[status];
}

export function daysFromDeadline(commitment: Commitment, now: Date): number | null {
  if (!commitment.deadline || commitment.status === "fulfilled") return null;
  return Math.ceil((new Date(`${commitment.deadline}T23:59:59Z`).getTime() - now.getTime()) / MS_PER_DAY);
}
