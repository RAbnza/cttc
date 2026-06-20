import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { fetchVocabBatch, resetVocabApiAvailability } from "../api/vocab";
import { CALIBRATION_WORDS } from "../data/calibrationWords";
import { sampleStory } from "../data/sampleStory";
import { getLocalVocabEntries } from "../data/sampleVocab";
import type {
  CalibrationPhase,
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
const CAMERA_KEY = "cttc-camera-enabled";

/** 10 columns, 6 rows grid. */
const CALIBRATION_COLS = 10;
const CALIBRATION_ROWS = 6;

const gridCellToTarget = (row: number, col: number): CalibrationTarget => {
  const stepX = 1 / CALIBRATION_COLS;
  const stepY = 1 / CALIBRATION_ROWS;
  return {
    x: col * stepX + stepX / 2,
    y: row * stepY + stepY / 2
  };
};

/** Row/col indices on the 10x6 grid. Sequence: 4 corners, 4 centers, edge centers, then remaining scattered. */
const generateCalibrationCellOrder = (): Array<[number, number]> => {
  const order: Array<[number, number]> = [];
  
  const added = new Set<string>();
  const add = (row: number, col: number) => {
    const key = `${row},${col}`;
    if (!added.has(key)) {
      added.add(key);
      order.push([row, col]);
    }
  };
  
  // 1. Corners
  add(0, 0);
  add(0, CALIBRATION_COLS - 1);
  add(CALIBRATION_ROWS - 1, CALIBRATION_COLS - 1);
  add(CALIBRATION_ROWS - 1, 0);
  
  // 2. Centers
  const rMid = Math.floor(CALIBRATION_ROWS / 2) - 1;
  const cMid = Math.floor(CALIBRATION_COLS / 2) - 1;
  add(rMid, cMid);
  add(rMid, cMid + 1);
  add(rMid + 1, cMid + 1);
  add(rMid + 1, cMid);

  // 3. Edge centers
  add(0, cMid);                           // Top mid-left
  add(0, cMid + 1);                       // Top mid-right
  add(CALIBRATION_ROWS - 1, cMid + 1);    // Bottom mid-right
  add(CALIBRATION_ROWS - 1, cMid);        // Bottom mid-left
  add(rMid, 0);                           // Left mid-top
  add(rMid + 1, 0);                       // Left mid-bottom
  add(rMid + 1, CALIBRATION_COLS - 1);    // Right mid-bottom
  add(rMid, CALIBRATION_COLS - 1);        // Right mid-top

  // 4. Remaining points scattered
  const remaining: Array<[number, number]> = [];
  for (let r = 0; r < CALIBRATION_ROWS; r++) {
    for (let c = 0; c < CALIBRATION_COLS; c++) {
      const key = `${r},${c}`;
      if (!added.has(key)) {
        remaining.push([r, c]);
      }
    }
  }
  
  // Deterministic scatter (stride by 17 to avoid sequential row-by-row lines)
  let currentIndex = 0;
  while (remaining.length > 0) {
    currentIndex = (currentIndex + 17) % remaining.length;
    const [r, c] = remaining.splice(currentIndex, 1)[0];
    add(r, c);
  }

  return order;
};

const CALIBRATION_CELL_ORDER = generateCalibrationCellOrder();

const CALIBRATION_TARGETS: CalibrationTarget[] = CALIBRATION_CELL_ORDER.map(
  ([row, col]) => gridCellToTarget(row, col)
);

const CALIBRATION_WORD_TARGETS = CALIBRATION_WORDS;

const buildStoryWordLocations = (lines: string[]) => {
  let wordIndex = 0;
  return lines.flatMap((line, lineIndex) =>
    line.split(" ").map((term) => ({ term, lineIndex, wordIndex: wordIndex++ }))
  );
};

const STORY_WORDS = buildStoryWordLocations(sampleStory);

const buildInitialWordMetrics = (): WordMetrics[] =>
  STORY_WORDS.map((word) => ({
    ...word,
    fixationMs: 0,
    rereads: 0,
    jitter: 0
  }));

const mergeWordMetrics = (metrics: WordMetrics[] | undefined): WordMetrics[] => {
  const metricsByWordIndex = new Map(
    (metrics ?? [])
      .filter((item) => Number.isFinite(item.wordIndex))
      .map((item) => [item.wordIndex, item] as const)
  );

  return buildInitialWordMetrics().map((word) => {
    const saved = metricsByWordIndex.get(word.wordIndex);
    if (!saved) {
      return word;
    }

    return {
      ...word,
      fixationMs: Number.isFinite(saved.fixationMs) ? saved.fixationMs : 0,
      rereads: Number.isFinite(saved.rereads) ? saved.rereads : 0,
      jitter: Number.isFinite(saved.jitter) ? saved.jitter : 0
    };
  });
};

const errorToQualityScore = (errors: number[]) => {
  if (!errors.length) return 0;

  const avgError = errors.reduce((sum, value) => sum + value, 0) / errors.length;
  return Math.max(0, Math.min(100, Math.round(100 - (avgError / 350) * 100)));
};

const recordWebGazerSample = (x: number, y: number) => {
  window.webgazer?.recordScreenPosition?.(x, y);
};

const buildCalibrationState = () => ({
  phase: "grid" as const,
  currentIndex: 0,
  totalTargets: CALIBRATION_TARGETS.length + CALIBRATION_WORD_TARGETS.length,
  gridTotalTargets: CALIBRATION_TARGETS.length,
  wordTotalTargets: CALIBRATION_WORD_TARGETS.length,
  qualityScore: 0,
  gridQualityScore: 0,
  wordQualityScore: 0,
  completed: false,
  target: CALIBRATION_TARGETS[0],
  currentWord: CALIBRATION_WORD_TARGETS[0] ?? null
});

const normalizeSession = (value: ReadingSession): ReadingSession => {
  const wordMetrics = mergeWordMetrics(value.wordMetrics);
  const calibration = value.calibration
    ? {
        phase: (value.calibration.phase === "words" ? "words" : "grid") as CalibrationPhase,
        currentIndex: Number.isFinite(value.calibration.currentIndex)
          ? value.calibration.currentIndex
          : 0,
        totalTargets: CALIBRATION_TARGETS.length + CALIBRATION_WORD_TARGETS.length,
        gridTotalTargets: CALIBRATION_TARGETS.length,
        wordTotalTargets: CALIBRATION_WORD_TARGETS.length,
        qualityScore: Number.isFinite(value.calibration.qualityScore)
          ? value.calibration.qualityScore
          : 0,
        gridQualityScore: Number.isFinite(value.calibration.gridQualityScore)
          ? value.calibration.gridQualityScore
          : 0,
        wordQualityScore: Number.isFinite(value.calibration.wordQualityScore)
          ? value.calibration.wordQualityScore
          : 0,
        completed: Boolean(value.calibration.completed),
        target:
          value.calibration.target &&
          Number.isFinite(value.calibration.target.x) &&
          Number.isFinite(value.calibration.target.y)
            ? value.calibration.target
            : CALIBRATION_TARGETS[0],
        currentWord:
          value.calibration.currentWord ??
          CALIBRATION_WORD_TARGETS[0] ??
          null
      }
    : buildCalibrationState();

  return {
    ...value,
    wordMetrics,
    difficultWords: extractDifficultWords(wordMetrics),
    analytics: buildAnalytics(
      wordMetrics,
      Number.isFinite(value.startedAt) ? value.startedAt : Date.now(),
      Number.isFinite(value.endedAt) ? value.endedAt : undefined
    ),
    calibration
  };
};

const buildAnalytics = (
  metrics: WordMetrics[],
  startedAt: number,
  endedAt = Date.now()
): ReadingAnalytics => {
  const totalTimeMs = Math.max(0, endedAt - startedAt);
  const totalWords = metrics.length;
  const wordsRead = metrics.filter((item) => item.fixationMs > 0).length;
  const fixationTotal = metrics.reduce((sum, item) => sum + item.fixationMs, 0);
  const rereadCount = metrics.reduce((sum, item) => sum + item.rereads, 0);
  const averageFixationMs = totalWords ? Math.round(fixationTotal / totalWords) : 0;
  const difficultCount = extractDifficultWords(metrics).length;

  return {
    totalTimeMs,
    totalWords,
    wordsRead,
    averageFixationMs,
    rereadCount,
    difficultCount
  };
};

const createSession = (): ReadingSession => ({
  id: `session-${Date.now()}`,
  startedAt: Date.now(),
  status: "idle",
  progressPercent: 0,
  calibration: buildCalibrationState(),
  gazePoints: [],
  wordMetrics: buildInitialWordMetrics(),
  difficultWords: [],
  analytics: {
    totalTimeMs: 0,
    totalWords: STORY_WORDS.length,
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
  const [latestSession, setLatestSession] = useState<ReadingSession | null>(null);
  const [vocabEntries, setVocabEntries] = useState<VocabEntry[]>([]);
  const [cameraEnabled, setCameraEnabled] = useLocalStorage(CAMERA_KEY, true);
  const wordRectsRef = useRef<WordRect[]>([]);
  const gridCalibrationErrorsRef = useRef<number[]>([]);
  const wordCalibrationErrorsRef = useRef<number[]>([]);
  const vocabApiUnavailableRef = useRef(false);
  const lastFetchedDifficultWordsKeyRef = useRef("");
  const postCalibrationStatusRef = useRef<"idle" | "tracking">("idle");
  const storyWords = useMemo(() => STORY_WORDS, []);
  const difficultWordsKey = useMemo(
    () => session.difficultWords.map((term) => term.trim().toLowerCase()).join("\u0000"),
    [session.difficultWords]
  );
  const webcamActive =
    cameraEnabled &&
    (session.status === "idle" ||
      session.status === "complete" ||
      session.status === "paused" ||
      session.status === "calibrating" ||
      session.status === "tracking");
  const { status: gazeStatus, gazePoint } = useWebGazer({
    enabled: webcamActive
  });
  const cameraReady = cameraEnabled && gazeStatus === "tracking";

  useEffect(() => {
    setPersistedSession(session);
  }, [session, setPersistedSession]);

  useEffect(() => {
    if (session.status !== "complete") return;
    setLatestSession(session);
  }, [session]);

  const setWordRects = useCallback((rects: WordRect[]) => {
    wordRectsRef.current = rects;
  }, []);

  const trackHighlightedWord = useCallback(
    (
      wordIndex: number,
      durationMs: number,
      jitter: number,
      point: GazePoint,
      rereadQualified: boolean
    ) => {
      setSession((prev) => {
        if (prev.status !== "tracking") return prev;

        const match = STORY_WORDS[wordIndex];
        if (!match) return prev;

        const nextMetrics = [...prev.wordMetrics];
        const existing = nextMetrics[wordIndex] ?? {
          ...match,
          fixationMs: 0,
          rereads: 0,
          jitter: 0
        };
        nextMetrics[wordIndex] = {
          ...existing,
          fixationMs: existing.fixationMs + Math.max(0, durationMs),
          rereads: rereadQualified ? existing.rereads + 1 : existing.rereads,
          jitter: Math.max(existing.jitter, jitter)
        };

        const progressPercent = Math.round(((wordIndex + 1) / storyWords.length) * 100);
        const nextStatus = progressPercent >= 100 ? "complete" : prev.status;
        const endedAt = nextStatus === "complete" ? prev.endedAt ?? point.timestamp : undefined;
        const difficultWords = extractDifficultWords(nextMetrics);
        const analytics = buildAnalytics(nextMetrics, prev.startedAt, endedAt);

        return {
          ...prev,
          endedAt,
          currentWord: match,
          progressPercent,
          gazePoints: [...prev.gazePoints.slice(-90), point],
          wordMetrics: nextMetrics,
          difficultWords,
          analytics,
          status: nextStatus
        };
      });
    },
    [storyWords.length]
  );

  const captureCalibrationSample = useCallback(
    (screenTarget?: { x: number; y: number }) => {
      if (!gazePoint) return;

      setSession((prev) => {
        if (prev.status !== "calibrating") return prev;

        if (prev.calibration.phase === "grid") {
          const target = CALIBRATION_TARGETS[prev.calibration.currentIndex];
          if (!target) return prev;
          if (!screenTarget) return prev;

          const targetX = screenTarget.x;
          const targetY = screenTarget.y;
          recordWebGazerSample(targetX, targetY);
          const error = Math.hypot(gazePoint.x - targetX, gazePoint.y - targetY);
          gridCalibrationErrorsRef.current = [
            ...gridCalibrationErrorsRef.current,
            error
          ];

          const nextIndex = prev.calibration.currentIndex + 1;
          const gridComplete = nextIndex >= CALIBRATION_TARGETS.length;

          if (gridComplete) {
            const gridQualityScore = errorToQualityScore(gridCalibrationErrorsRef.current);
            wordCalibrationErrorsRef.current = [];

            return {
              ...prev,
              calibration: {
                ...prev.calibration,
                phase: "words",
                currentIndex: 0,
                gridQualityScore,
                completed: false,
                currentWord: CALIBRATION_WORD_TARGETS[0] ?? null,
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
        }

        const wordTarget =
          CALIBRATION_WORD_TARGETS[prev.calibration.currentIndex] ??
          prev.calibration.currentWord;
        if (!wordTarget || !screenTarget) return prev;

        recordWebGazerSample(screenTarget.x, screenTarget.y);
        const error = Math.hypot(
          gazePoint.x - screenTarget.x,
          gazePoint.y - screenTarget.y
        );
        wordCalibrationErrorsRef.current = [
          ...wordCalibrationErrorsRef.current,
          error
        ];

        const nextIndex = prev.calibration.currentIndex + 1;
        const wordsComplete = nextIndex >= CALIBRATION_WORD_TARGETS.length;

        if (wordsComplete) {
          const wordQualityScore = errorToQualityScore(wordCalibrationErrorsRef.current);
          const gridQualityScore = prev.calibration.gridQualityScore;
          const qualityScore = Math.round((gridQualityScore + wordQualityScore) / 2);

          return {
            ...prev,
            status: postCalibrationStatusRef.current,
            calibration: {
              ...prev.calibration,
              phase: "words",
              currentIndex: CALIBRATION_WORD_TARGETS.length,
              wordQualityScore,
              qualityScore,
              completed: true,
              currentWord:
                CALIBRATION_WORD_TARGETS[CALIBRATION_WORD_TARGETS.length - 1] ?? null
            }
          };
        }

        return {
          ...prev,
          calibration: {
            ...prev.calibration,
            currentIndex: nextIndex,
            completed: false,
            currentWord: CALIBRATION_WORD_TARGETS[nextIndex] ?? null
          }
        };
      });
    },
    [gazePoint]
  );

  useEffect(() => {
    if (!session.difficultWords.length) {
      lastFetchedDifficultWordsKeyRef.current = "";
      setVocabEntries([]);
      return;
    }

    if (lastFetchedDifficultWordsKeyRef.current === difficultWordsKey) {
      return;
    }

    lastFetchedDifficultWordsKeyRef.current = difficultWordsKey;

    if (vocabApiUnavailableRef.current) {
      setVocabEntries(getLocalVocabEntries(session.difficultWords));
      return;
    }

    fetchVocabBatch(session.difficultWords)
      .then((response) => {
        vocabApiUnavailableRef.current = false;
        setVocabEntries(response.entries);
      })
      .catch(() => {
        // Stop retrying a down API and switch to local definitions.
        vocabApiUnavailableRef.current = true;
        setVocabEntries(getLocalVocabEntries(session.difficultWords));
      });
  }, [difficultWordsKey, session.difficultWords]);

  const startCalibration = useCallback(() => {
    if (!cameraEnabled || gazeStatus !== "tracking") return;

    gridCalibrationErrorsRef.current = [];
    wordCalibrationErrorsRef.current = [];
    postCalibrationStatusRef.current = "idle";
    setSession((prev) => ({
      ...prev,
      status: "calibrating",
      calibration: buildCalibrationState()
    }));
  }, [cameraEnabled, gazeStatus]);

  const startReadingSession = useCallback(() => {
    if (!cameraEnabled || gazeStatus !== "tracking") return;

    resetVocabApiAvailability();

    setSession((prev) => {
      if (!prev.calibration.completed) return prev;

      gridCalibrationErrorsRef.current = [];
      wordCalibrationErrorsRef.current = [];
      vocabApiUnavailableRef.current = false;
      lastFetchedDifficultWordsKeyRef.current = "";
      setLatestSession(null);

      return {
        ...createSession(),
        calibration: prev.calibration,
        status: "tracking"
      };
    });
  }, [cameraEnabled, gazeStatus]);

  const restartCalibration = useCallback(() => {
    gridCalibrationErrorsRef.current = [];
    wordCalibrationErrorsRef.current = [];
    setSession((prev) => {
      postCalibrationStatusRef.current =
        prev.status === "tracking" || prev.status === "paused" ? "tracking" : "idle";

      return {
        ...prev,
        status: "calibrating",
        calibration: buildCalibrationState()
      };
    });
  }, []);

  const pauseSession = useCallback(() => {
    setSession((prev) => ({ ...prev, status: "paused" }));
  }, []);

  const resumeSession = useCallback(() => {
    setSession((prev) => ({ ...prev, status: "tracking" }));
  }, []);

  const stopSession = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      endedAt: Date.now(),
      status: "complete",
      difficultWords: extractDifficultWords(prev.wordMetrics),
      analytics: buildAnalytics(prev.wordMetrics, prev.startedAt, Date.now())
    }));
  }, []);

  const storyLines = useMemo(() => sampleStory, []);

  return {
    session,
    latestSession,
    gazeStatus,
    gazePoint,
    cameraEnabled,
    cameraReady,
    vocabEntries,
    storyLines,
    setWordRects,
    setCameraEnabled,
    actions: {
      startCalibration,
      startReadingSession,
      trackHighlightedWord,
      captureCalibrationSample,
      restartCalibration,
      pauseSession,
      resumeSession,
      stopSession
    }
  } as const;
};
