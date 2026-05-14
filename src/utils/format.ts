export const formatMs = (value: number): string => {
  if (value < 1000) return `${value}ms`;
  const seconds = Math.round(value / 100) / 10;
  return `${seconds}s`;
};

export const formatPercent = (value: number): string =>
  `${Math.min(100, Math.max(0, Math.round(value)))}%`;
