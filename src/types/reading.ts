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
  wordsRead: number;
  averageFixationMs: number;
  rereadCount: number;
  difficultCount: number;
};

export type CalibrationTarget = {
  x: number;
  y: number;
};

export type CalibrationState = {
  currentIndex: number;
  totalTargets: number;
  qualityScore: number;
  completed: boolean;
  target: CalibrationTarget;
};

export type ReadingSession = {
  id: string;
  startedAt: number;
  status: ReadingStatus;
  progressPercent: number;
  calibration: CalibrationState;
  currentWord?: WordLocation;
  gazePoints: GazePoint[];
  wordMetrics: WordMetrics[];
  difficultWords: string[];
  analytics: ReadingAnalytics;
};
