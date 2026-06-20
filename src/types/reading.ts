export type ReadingStatus = "idle" | "calibrating" | "tracking" | "paused" | "complete";

export type GazePoint = {
  x: number;
  y: number;
  timestamp: number;
};

export type WordLocation = {
  term: string;
  lineIndex: number;
  wordIndex: number;
};

export type WordRect = WordLocation & {
  rect: DOMRect;
};

export type WordMetrics = WordLocation & {
  fixationMs: number;
  rereads: number;
  jitter: number;
};

export type ReadingAnalytics = {
  totalTimeMs: number;
  totalWords: number;
  wordsRead: number;
  averageFixationMs: number;
  rereadCount: number;
  difficultCount: number;
};

export type CalibrationPhase = "grid" | "words";

export type CalibrationTarget = {
  x: number;
  y: number;
};

export type WordCalibrationTarget = {
  term: string;
  row: number;
  col: number;
};

export type CalibrationState = {
  phase: CalibrationPhase;
  currentIndex: number;
  totalTargets: number;
  gridTotalTargets: number;
  wordTotalTargets: number;
  qualityScore: number;
  gridQualityScore: number;
  wordQualityScore: number;
  completed: boolean;
  target: CalibrationTarget;
  currentWord: WordCalibrationTarget | null;
};

export type ReadingSession = {
  id: string;
  startedAt: number;
  endedAt?: number;
  status: ReadingStatus;
  progressPercent: number;
  calibration: CalibrationState;
  currentWord?: WordLocation;
  gazePoints: GazePoint[];
  wordMetrics: WordMetrics[];
  difficultWords: string[];
  analytics: ReadingAnalytics;
};
