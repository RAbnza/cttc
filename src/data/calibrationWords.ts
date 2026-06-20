import type { WordCalibrationTarget } from "../types/reading";

/** Words placed on the 10×6 reading grid for phase-2 calibration. */
export const CALIBRATION_WORDS: WordCalibrationTarget[] = [
  { term: "Look", row: 0, col: 1 },
  { term: "Here", row: 0, col: 8 },
  { term: "Track", row: 1, col: 4 },
  { term: "Eyes", row: 1, col: 9 },
  { term: "Scan", row: 2, col: 0 },
  { term: "Word", row: 2, col: 5 },
  { term: "Gaze", row: 2, col: 9 },
  { term: "Line", row: 3, col: 2 },
  { term: "Text", row: 3, col: 7 },
  { term: "Focus", row: 4, col: 0 },
  { term: "Read", row: 4, col: 5 },
  { term: "Next", row: 4, col: 9 },
  { term: "Calm", row: 5, col: 1 },
  { term: "Stay", row: 5, col: 4 },
  { term: "Clear", row: 5, col: 8 }
];
