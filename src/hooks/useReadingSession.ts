import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { fetchVocabBatch } from "../api/vocab";
import { sampleStory } from "../data/sampleStory";
import { getLocalVocabEntries } from "../data/sampleVocab";
import type {
  CalibrationTarget,
  GazePoint,
  ReadingAnalytics,
  ReadingSession,
  WordMetrics,
  WordRect
} from "../types/reading";
import type { VocabEntry } from "../types/vocab";
import { extractDifficultWords } from "../utils/gaze";
import { useLocalStorage } from "./useLocalStorage";
import { useWebGazer } from "./useWebGazer";

const SESSION_KEY = "cttc-reading-session";

/** 5×5 grid with inset margins; order: corners → remaining edges → inner ring → center. */
const CALIBRATION_GRID = 5;
const CALIBRATION_MARGIN = 0.08;

const gridCellToTarget = (row: number, col: number): CalibrationTarget => {
  const span = 1 - 2 * CALIBRATION_MARGIN;
  const step = span / (CALIBRATION_GRID - 1);
  return {
    x: CALIBRATION_MARGIN + col * step,
    y: CALIBRATION_MARGIN + row * step
  };
};

/** Row/col indices on the 5×5 grid (0 = top/left). */
const CALIBRATION_CELL_ORDER: Array<[number, number]> = [
  [0, 0],
  [0, 4],
  [4, 4],
  [4, 0],
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 3],
  [4, 2],
  [4, 1],
  [3, 0],
  [2, 0],
  [1, 0],
  [1, 1],
  [1, 2],
  [1, 3],
  [2, 3],
  [3, 3],
  [3, 2],
  [3, 1],
  [2, 1],
  [2, 2]
];

const CALIBRATION_TARGETS: CalibrationTarget[] = CALIBRATION_CELL_ORDER.map(
  ([row, col]) => gridCellToTarget(row, col)
);

const buildCalibrationState = () => ({
  currentIndex: 0,
  totalTargets: CALIBRATION_TARGETS.length,
  qualityScore: 0,
  completed: false,
  target: CALIBRATION_TARGETS[0]
});

const normalizeSession = (value: ReadingSession): ReadingSession => {
  const calibration = value.calibration
    ? {
        currentIndex: Number.isFinite(value.calibration.currentIndex)
          ? value.calibration.currentIndex
          : 0,
        totalTargets: CALIBRATION_TARGETS.length,
        qualityScore: Number.isFinite(value.calibration.qualityScore)
          ? value.calibration.qualityScore
          : 0,
        completed: Boolean(value.calibration.completed),
        target:
          value.calibration.target &&
          Number.isFinite(value.calibration.target.x) &&
          Number.isFinite(value.calibration.target.y)
            ? value.calibration.target
            : CALIBRATION_TARGETS[0]
      }
    : buildCalibrationState();

  return {
    ...value,
    calibration
  };
};

const buildAnalytics = (metrics: WordMetrics[], startedAt: number): ReadingAnalytics => {
  const totalTimeMs = Date.now() - startedAt;
  const wordsRead = metrics.length;
  const fixationTotal = metrics.reduce((sum, item) => sum + item.fixationMs, 0);
  const rereadCount = metrics.reduce((sum, item) => sum + item.rereads, 0);
  const averageFixationMs = wordsRead ? Math.round(fixationTotal / wordsRead) : 0;
  const difficultCount = extractDifficultWords(metrics).length;

  return { totalTimeMs, wordsRead, averageFixationMs, rereadCount, difficultCount };
};

const createSession = (): ReadingSession => ({
  id: `session-${Date.now()}`,
  startedAt: Date.now(),
  status: "idle",
  progressPercent: 0,
  calibration: buildCalibrationState(),
  gazePoints: [],
  wordMetrics: [],
  difficultWords: [],
  analytics: {
    totalTimeMs: 0,
    wordsRead: 0,
    averageFixationMs: 0,
    rereadCount: 0,
    difficultCount: 0
  }
});

export const useReadingSession = () => {
  const [persistedSession, setPersistedSession] = useLocalStorage(
    SESSION_KEY,
    createSession()
  );
  const [session, setSession] = useState<ReadingSession>(() =>
    normalizeSession(persistedSession)
  );
  const [vocabEntries, setVocabEntries] = useState<VocabEntry[]>([]);
  const wordRectsRef = useRef<WordRect[]>([]);
  const calibrationErrorsRef = useRef<number[]>([]);
  const lastGazeRef = useRef<{ point: GazePoint; wordIndex?: number } | null>(
    null
  );
  const storyWords = useMemo(() => sampleStory.join(" ").split(" "), []);
  const { status: gazeStatus, gazePoint } = useWebGazer({
    enabled: session.status === "tracking" || session.status === "calibrating"
  });

  useEffect(() => {
    setSession((prev) => normalizeSession(prev));
  }, []);

  useEffect(() => {
    setPersistedSession(session);
  }, [session, setPersistedSession]);

  useEffect(() => {
    if (!gazePoint) return;

    setSession((prev) => ({
      ...prev,
      gazePoints: [...prev.gazePoints.slice(-90), gazePoint]
    }));
  }, [gazePoint]);

  const setWordRects = useCallback((rects: WordRect[]) => {
    wordRectsRef.current = rects;
  }, []);

  const resolveWordAtPoint = useCallback((point: GazePoint) => {
    const match = wordRectsRef.current.find(
      (item) =>
        point.x >= item.rect.left &&
        point.x <= item.rect.right &&
        point.y >= item.rect.top &&
        point.y <= item.rect.bottom
    );
    return match ?? null;
  }, []);

  useEffect(() => {
    if (session.status !== "tracking" || !gazePoint) return;

    const match = resolveWordAtPoint(gazePoint);
    if (!match) {
      lastGazeRef.current = { point: gazePoint };
      return;
    }

    setSession((prev) => {
      const last = lastGazeRef.current;
      const elapsed = last
        ? Math.min(2000, gazePoint.timestamp - last.point.timestamp)
        : 120;
      const jitter =
        last && last.wordIndex === match.wordIndex
          ? Math.round(
              Math.min(
                30,
                Math.hypot(gazePoint.x - last.point.x, gazePoint.y - last.point.y)
              )
            )
          : 0;

      const existingIndex = prev.wordMetrics.findIndex(
        (item) => item.wordIndex === match.wordIndex
      );
      const nextMetrics = [...prev.wordMetrics];

      if (existingIndex >= 0) {
        const existing = nextMetrics[existingIndex];
        nextMetrics[existingIndex] = {
          ...existing,
          fixationMs: existing.fixationMs + (last?.wordIndex === match.wordIndex ? elapsed : 0),
          rereads:
            last && last.wordIndex !== match.wordIndex
              ? existing.rereads + 1
              : existing.rereads,
          jitter: Math.max(existing.jitter, jitter)
        };
      } else {
        nextMetrics.push({
          term: match.term,
          lineIndex: match.lineIndex,
          wordIndex: match.wordIndex,
          fixationMs: elapsed,
          rereads: 0,
          jitter
        });
      }

      const progressPercent = Math.round(
        ((match.wordIndex + 1) / storyWords.length) * 100
      );
      const difficultWords = extractDifficultWords(nextMetrics);
      const analytics = buildAnalytics(nextMetrics, prev.startedAt);

      return {
        ...prev,
        progressPercent,
        currentWord: {
          term: match.term,
          lineIndex: match.lineIndex,
          wordIndex: match.wordIndex
        },
        wordMetrics: nextMetrics,
        difficultWords,
        analytics,
        status: progressPercent >= 100 ? "complete" : prev.status
      };
    });

    lastGazeRef.current = { point: gazePoint, wordIndex: match.wordIndex };
  }, [gazePoint, resolveWordAtPoint, session.status, storyWords.length]);

  useEffect(() => {
    if (session.status === "tracking") return;
    lastGazeRef.current = null;
  }, [session.status]);

  const captureCalibrationSample = useCallback(() => {
    if (!gazePoint) return;

    setSession((prev) => {
      if (prev.status !== "calibrating") return prev;

      const target = CALIBRATION_TARGETS[prev.calibration.currentIndex];
      if (!target) return prev;

      const targetX = window.innerWidth * target.x;
      const targetY = window.innerHeight * target.y;
      const error = Math.hypot(gazePoint.x - targetX, gazePoint.y - targetY);
      calibrationErrorsRef.current = [...calibrationErrorsRef.current, error];

      const nextIndex = prev.calibration.currentIndex + 1;
      const completed = nextIndex >= CALIBRATION_TARGETS.length;

      if (completed) {
        const avgError =
          calibrationErrorsRef.current.reduce((sum, value) => sum + value, 0) /
          calibrationErrorsRef.current.length;
        const qualityScore = Math.max(
          0,
          Math.min(100, Math.round(100 - (avgError / 350) * 100))
        );

        return {
          ...prev,
          status: "tracking",
          calibration: {
            ...prev.calibration,
            currentIndex: CALIBRATION_TARGETS.length,
            qualityScore,
            completed: true,
            target: CALIBRATION_TARGETS[CALIBRATION_TARGETS.length - 1]
          }
        };
      }

      return {
        ...prev,
        calibration: {
          ...prev.calibration,
          currentIndex: nextIndex,
          completed: false,
          target: CALIBRATION_TARGETS[nextIndex]
        }
      };
    });
  }, [gazePoint]);

  useEffect(() => {
    if (!session.difficultWords.length) return;

    fetchVocabBatch(session.difficultWords)
      .then((response) => setVocabEntries(response.entries))
      .catch(() => {
        // Fallback to local suggestions if the API is unreachable.
        setVocabEntries(getLocalVocabEntries(session.difficultWords));
      });
  }, [session.difficultWords]);

  const startSession = useCallback(() => {
    calibrationErrorsRef.current = [];
    setSession(() => ({
      ...createSession(),
      status: "calibrating"
    }));
  }, []);

  const restartCalibration = useCallback(() => {
    calibrationErrorsRef.current = [];
    setSession((prev) => ({
      ...prev,
      status: "calibrating",
      calibration: buildCalibrationState()
    }));
  }, []);

  const pauseSession = useCallback(() => {
    setSession((prev) => ({ ...prev, status: "paused" }));
  }, []);

  const resumeSession = useCallback(() => {
    setSession((prev) => ({ ...prev, status: "tracking" }));
  }, []);

  const stopSession = useCallback(() => {
    setSession((prev) => ({ ...prev, status: "complete", progressPercent: 100 }));
  }, []);

  const storyLines = useMemo(() => sampleStory, []);

  return {
    session,
    gazeStatus,
    vocabEntries,
    storyLines,
    setWordRects,
    actions: {
      startSession,
      captureCalibrationSample,
      restartCalibration,
      pauseSession,
      resumeSession,
      stopSession
    }
  } as const;
};
