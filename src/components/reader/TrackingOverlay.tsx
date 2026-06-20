import { motion } from "framer-motion";
import { BookOpen, Pause, Square } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import type { GazePoint, ReadingSession, WordRect } from "../../types/reading";
import { cn } from "../../utils/cn";
import { REREAD_THRESHOLD_MS } from "../../utils/gaze";
import { Button } from "../ui/Button";

type TrackingOverlayProps = {
  session: ReadingSession;
  lines: string[];
  gazePoint: GazePoint | null;
  onWordLayout?: (rects: WordRect[]) => void;
  onHighlightWord?: (
    wordIndex: number,
    durationMs: number,
    jitter: number,
    point: GazePoint,
    rereadQualified: boolean
  ) => void;
  onPause: () => void;
  onFinish: () => void;
};

const GRID_STYLE = {
  gridTemplateColumns: "repeat(10, 1fr)",
  gridTemplateRows: "repeat(6, 1fr)"
} as const;

export const TrackingOverlay = ({
  session,
  lines,
  gazePoint,
  onWordLayout,
  onHighlightWord,
  onPause,
  onFinish
}: TrackingOverlayProps) => {
  const wordRefs = useRef<Array<HTMLElement | null>>([]);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const lastHighlightRef = useRef<{
    wordIndex: number;
    point: GazePoint;
  } | null>(null);
  const activeWordSegmentRef = useRef<{
    wordIndex: number;
    startedAt: number;
    isRevisit: boolean;
    rereadQualified: boolean;
  } | null>(null);
  const wordItems = useMemo(() => {
    let wordIndex = 0;
    return lines.map((line, lineIndex) =>
      line.split(" ").map((term) => ({ term, lineIndex, wordIndex: wordIndex++ }))
    );
  }, [lines]);

  const allWords = useMemo(() => wordItems.flat(), [wordItems]);
  const currentWord = session.currentWord;
  const resolveWordIndexFromPoint = useCallback((point: GazePoint) => {
    const gridRect = gridRef.current?.getBoundingClientRect();
    if (!gridRect || gridRect.width === 0 || gridRect.height === 0) {
      return null;
    }

    const candidates = [
      point,
      {
        ...point,
        x: point.x - window.scrollX,
        y: point.y - window.scrollY
      }
    ];

    for (const candidate of candidates) {
      const insideGrid =
        candidate.x >= gridRect.left &&
        candidate.x <= gridRect.right &&
        candidate.y >= gridRect.top &&
        candidate.y <= gridRect.bottom;

      if (!insideGrid) {
        continue;
      }

      const col = Math.min(
        9,
        Math.max(0, Math.floor(((candidate.x - gridRect.left) / gridRect.width) * 10))
      );
      const row = Math.min(
        5,
        Math.max(0, Math.floor(((candidate.y - gridRect.top) / gridRect.height) * 6))
      );
      const wordIndex = row * 10 + col;

      return allWords[wordIndex] ? wordIndex : null;
    }

    return null;
  }, [allWords]);

  const emitLayout = useCallback(() => {
    if (!onWordLayout) return;
    const rects: WordRect[] = [];
    allWords.forEach((item) => {
      const node = wordRefs.current[item.wordIndex];
      if (!node) return;
      rects.push({ ...item, rect: node.getBoundingClientRect() });
    });
    onWordLayout(rects);
  }, [allWords, onWordLayout]);

  useLayoutEffect(() => {
    emitLayout();
  }, [emitLayout]);

  useEffect(() => {
    if (!onWordLayout) return;
    const handle = () => emitLayout();
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);
    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [emitLayout, onWordLayout]);

  useEffect(() => {
    if (!gazePoint || !onHighlightWord) return;

    const wordIndex = resolveWordIndexFromPoint(gazePoint);
    if (wordIndex === null) {
      lastHighlightRef.current = null;
      activeWordSegmentRef.current = null;
      return;
    }

    const last = lastHighlightRef.current;
    const durationMs =
      last && last.wordIndex === wordIndex
        ? Math.min(2000, gazePoint.timestamp - last.point.timestamp)
        : 0;
    const jitter =
      last && last.wordIndex === wordIndex
        ? Math.round(
            Math.min(30, Math.hypot(gazePoint.x - last.point.x, gazePoint.y - last.point.y))
          )
        : 0;

    const activeSegment = activeWordSegmentRef.current;
    if (!activeSegment || activeSegment.wordIndex !== wordIndex) {
      activeWordSegmentRef.current = {
        wordIndex,
        startedAt: gazePoint.timestamp,
        isRevisit: (session.wordMetrics[wordIndex]?.fixationMs ?? 0) > 0,
        rereadQualified: false
      };
    }

    let rereadQualified = false;
    const nextSegment = activeWordSegmentRef.current;
    if (nextSegment?.isRevisit && !nextSegment.rereadQualified) {
      const revisitDurationMs = gazePoint.timestamp - nextSegment.startedAt;
      if (revisitDurationMs >= REREAD_THRESHOLD_MS) {
        rereadQualified = true;
        activeWordSegmentRef.current = {
          ...nextSegment,
          rereadQualified: true
        };
      }
    }

    onHighlightWord(wordIndex, durationMs, jitter, gazePoint, rereadQualified);
    lastHighlightRef.current = { wordIndex, point: gazePoint };
  }, [gazePoint, onHighlightWord, resolveWordIndexFromPoint, session.wordMetrics]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f8f9fb] font-sans tracking-normal">
      <header className="shrink-0 border-b border-ink-200/80 bg-white/95 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-white">
              <BookOpen size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">
                Reading session
              </p>
              <p className="truncate text-sm font-semibold text-ink-900">
                {currentWord?.term ? (
                  <>
                    Tracking:{" "}
                    <span className="text-mint-700">{currentWord.term}</span>
                  </>
                ) : (
                  "Follow the story with your eyes"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold tabular-nums text-ink-600 sm:inline">
              {session.progressPercent}%
            </span>
            <Button variant="outline" size="sm" onClick={onPause}>
              <Pause size={14} />
              Pause
            </Button>
            <Button size="sm" onClick={onFinish}>
              <Square size={14} />
              Finish
            </Button>
          </div>
        </div>

        <div className="px-5 pb-3 sm:px-6">
          <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
            <motion.div
              className="h-full rounded-full bg-mint-500"
              initial={false}
              animate={{ width: `${session.progressPercent}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      <main className="relative min-h-0 flex-1 overflow-hidden">
        <div className="absolute inset-0 grid pointer-events-none" style={GRID_STYLE}>
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="border border-ink-200/60" />
          ))}
        </div>

        <div
          ref={gridRef}
          className="absolute inset-0 grid sm:text-[1.2rem] md:text-[1.5rem] lg:text-[1.6rem]"
          style={GRID_STYLE}
        >
          {allWords.map((word) => {
            const isActive =
              currentWord?.lineIndex === word.lineIndex &&
              currentWord?.wordIndex === word.wordIndex;

            const isLongWord = word.term.length > 7;
            const isVeryLongWord = word.term.length > 10;

            return (
              <motion.div
                key={word.wordIndex}
                className={cn(
                  "relative flex items-center justify-center border transition-colors",
                  isActive
                    ? "z-10 border-mint-400/50 bg-ink-900 text-white shadow-[0_4px_20px_rgba(23,21,35,0.18)]"
                    : "z-0 border-transparent bg-transparent text-ink-800"
                )}
                ref={(node) => {
                  wordRefs.current[word.wordIndex] = node;
                }}
                animate={{ scale: isActive ? 1.03 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {isActive && (
                  <span className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-mint-400/40" />
                )}
                <span
                  className={cn(
                    "relative px-1 text-center font-medium",
                    isVeryLongWord ? "text-[65%]" : isLongWord ? "text-[85%]" : "text-[100%]"
                  )}
                >
                  {word.term}
                </span>
              </motion.div>
            );
          })}
        </div>
      </main>

      <footer className="shrink-0 border-t border-ink-200/80 bg-white/95 px-5 py-2.5 backdrop-blur-md sm:px-6">
        <p className="text-center text-xs text-ink-500">
          Gaze tracking is active · {session.analytics.wordsRead} words read ·{" "}
          {session.progressPercent}% complete
        </p>
      </footer>
    </div>
  );
};
