import type { WordMetrics } from "../types/reading";

export const REREAD_THRESHOLD_MS = 1200;
const MIN_STRUGGLE_FIXATION_MS = 1200;
const STRONG_STRUGGLE_FIXATION_MS = 2200;
const MIN_STRUGGLE_REREADS = 2;
const MIN_STRUGGLE_JITTER = 18;
const MIN_DIFFICULTY_SCORE = 0.82;

export const scoreDifficulty = (metrics: WordMetrics): number => {
  const fixationScore = Math.min(metrics.fixationMs / STRONG_STRUGGLE_FIXATION_MS, 1);
  const rereadScore = Math.min(metrics.rereads / MIN_STRUGGLE_REREADS, 1);
  const jitterScore = Math.min(metrics.jitter / 24, 1);
  return Number((fixationScore * 0.6 + rereadScore * 0.3 + jitterScore * 0.1).toFixed(2));
};

export const extractDifficultWords = (metrics: WordMetrics[]): string[] =>
  metrics
    .map((item) => ({ ...item, score: scoreDifficulty(item) }))
    .filter(
      (item) =>
        item.score >= MIN_DIFFICULTY_SCORE &&
        item.fixationMs >= MIN_STRUGGLE_FIXATION_MS &&
        (
          item.rereads >= MIN_STRUGGLE_REREADS ||
          item.fixationMs >= STRONG_STRUGGLE_FIXATION_MS ||
          item.jitter >= MIN_STRUGGLE_JITTER
        )
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.term);
