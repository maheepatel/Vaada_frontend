import type { Commitment } from "./types";

type DistrictRanking = {
  name: string;
  slug: string;
  records: number;
};

export type PlaceRanking = {
  rank: number;
  state: string;
  stateSlug: string;
  records: number;
  completed: number;
  unfinished: number;
  averageProgress: number;
  score: number;
  districts: DistrictRanking[];
};

export function rankStates(commitments: Commitment[]): PlaceRanking[] {
  const grouped = new Map<string, Commitment[]>();
  for (const item of commitments) {
    grouped.set(item.state, [...(grouped.get(item.state) ?? []), item]);
  }

  const sorted = [...grouped.entries()]
    .map(([state, items]) => {
      const completed = items.filter((item) => item.status === "fulfilled").length;
      const averageProgress = Math.round(
        items.reduce((total, item) => total + item.progress, 0) / items.length,
      );
      const districtCounts = new Map<string, DistrictRanking>();

      for (const item of items) {
        districtCounts.set(item.districtSlug, {
          name: item.district,
          slug: item.districtSlug,
          records: (districtCounts.get(item.districtSlug)?.records ?? 0) + 1,
        });
      }

      return {
        rank: 0,
        state,
        stateSlug: items[0].stateSlug,
        records: items.length,
        completed,
        unfinished: items.length - completed,
        averageProgress,
        districts: [...districtCounts.values()].sort(
          (a, b) => b.records - a.records || a.name.localeCompare(b.name),
        ),
        // Only a human verified completion changes the accountability score.
        // Progress remains visible context and cannot inflate a state's rank.
        score: Math.round((completed / items.length) * 100),
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.records - a.records ||
        a.state.localeCompare(b.state),
    );

  let previousScore: number | null = null;
  let sharedRank = 0;
  return sorted.map((item, index) => {
    if (item.score !== previousScore) sharedRank = index + 1;
    previousScore = item.score;
    return { ...item, rank: sharedRank };
  });
}
