import type { WordMetrics } from "../types/reading";

export const scoreDifficulty = (metrics: WordMetrics): number => {
  const fixationScore = Math.min(metrics.fixationMs / 650, 1);
  const rereadScore = Math.min(metrics.rereads / 3, 1);
  const jitterScore = Math.min(metrics.jitter / 20, 1);
  return Number((fixationScore * 0.5 + rereadScore * 0.35 + jitterScore * 0.15).toFixed(2));
};

export const extractDifficultWords = (metrics: WordMetrics[]): string[] =>
  metrics
    .map((item) => ({ term: item.term, score: scoreDifficulty(item) }))
    .filter((item) => item.score >= 0.6)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((item) => item.term);
