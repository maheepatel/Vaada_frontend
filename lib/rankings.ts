import type { Commitment } from "./types";

export type PlaceRanking = { state: string; stateSlug: string; records: number; completed: number; averageProgress: number; score: number; districts: { name: string; slug: string; records: number }[] };

export function rankStates(commitments: Commitment[]): PlaceRanking[] {
  const grouped = new Map<string, Commitment[]>();
  for (const item of commitments) grouped.set(item.state, [...(grouped.get(item.state) ?? []), item]);
  return [...grouped.entries()].map(([state, items]) => {
    const completed = items.filter((item) => item.status === "fulfilled").length;
    const averageProgress = Math.round(items.reduce((total, item) => total + item.progress, 0) / items.length);
    const districtCounts = new Map<string, { name: string; slug: string; records: number }>();
    for (const item of items) districtCounts.set(item.districtSlug, { name: item.district, slug: item.districtSlug, records: (districtCounts.get(item.districtSlug)?.records ?? 0) + 1 });
    return { state, stateSlug: items[0].stateSlug, records: items.length, completed, averageProgress, districts: [...districtCounts.values()].sort((a,b) => b.records - a.records || a.name.localeCompare(b.name)), score: Math.round(averageProgress * .7 + (completed / items.length) * 30) };
  }).sort((a, b) => b.score - a.score || b.records - a.records || a.state.localeCompare(b.state));
}
