import { motion } from "framer-motion";
import { Camera, Crosshair, Target } from "lucide-react";
import { useRef, type RefObject } from "react";

import { CALIBRATION_WORDS } from "../../data/calibrationWords";
import type { CalibrationState } from "../../types/reading";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";

type CalibrationOverlayProps = {
  calibration: CalibrationState;
  gazeStatus: string;
  onCapture: (screenTarget?: { x: number; y: number }) => void;
};

const GRID_COLS = 10;
const GRID_ROWS = 6;

const GRID_STYLE = {
  gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
  gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`
} as const;

const targetToCell = (target: { x: number; y: number }) => ({
  col: Math.min(
    GRID_COLS - 1,
    Math.max(0, Math.round(target.x * GRID_COLS - 0.5))
  ),
  row: Math.min(
    GRID_ROWS - 1,
    Math.max(0, Math.round(target.y * GRID_ROWS - 0.5))
  )
});

const CalibrationTargetDot = ({
  dotRef,
  onCapture
}: {
  dotRef: RefObject<HTMLButtonElement | null>;
  onCapture: () => void;
}) => (
  <div className="pointer-events-none relative flex h-full w-full items-center justify-center">
    <motion.span
      className="absolute h-10 w-10 rounded-full border-2 border-mint-400/50"
      animate={{ scale: [1, 1.5, 1], opacity: [0.45, 0.12, 0.45] }}
      transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
    />
    <motion.button
      ref={dotRef}
      type="button"
      className="pointer-events-auto relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-mint-500 shadow-[0_0_16px_rgba(103,203,180,0.5)]"
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
      onClick={onCapture}
      aria-label="Capture calibration point"
    >
      <span className="h-2 w-2 rounded-full bg-white" />
    </motion.button>
  </div>
);

export const CalibrationOverlay = ({
  calibration,
  gazeStatus,
  onCapture
}: CalibrationOverlayProps) => {
  const activeWordRef = useRef<HTMLButtonElement | null>(null);
  const dotRef = useRef<HTMLButtonElement | null>(null);
  const isWordPhase = calibration.phase === "words";
  const stepTotal = isWordPhase
    ? calibration.wordTotalTargets
    : calibration.gridTotalTargets;
  const stepIndex = Math.min(calibration.currentIndex + 1, stepTotal);
  const overallIndex =
    (isWordPhase ? calibration.gridTotalTargets : 0) + calibration.currentIndex + 1;
  const progressPercent = Math.round(
    (Math.min(overallIndex, calibration.totalTargets) / calibration.totalTargets) * 100
  );
  const targetCell = targetToCell(calibration.target);

  const captureFromNode = (node: HTMLElement | null) => {
    if (!node) return;
    const rect = node.getBoundingClientRect();
    onCapture({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
  };

  const captureGridTarget = () => captureFromNode(dotRef.current);
  const captureActiveWord = () => captureFromNode(activeWordRef.current);

  const handleCapture = () => {
    if (isWordPhase) {
      captureActiveWord();
      return;
    }
    captureGridTarget();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink-900">
      <header className="shrink-0 border-b border-white/10 bg-ink-900/95 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
              Gaze calibration
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  !isWordPhase
                    ? "bg-mint-500/20 text-mint-300 ring-1 ring-mint-400/30"
                    : "bg-white/10 text-white/50"
                )}
              >
                Part 1 · Grid
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  isWordPhase
                    ? "bg-mint-500/20 text-mint-300 ring-1 ring-mint-400/30"
                    : "bg-white/10 text-white/50"
                )}
              >
                Part 2 · Words
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 sm:inline-flex">
              <Camera size={13} />
              {gazeStatus}
            </span>
            <Button
              className="bg-mint-500 text-ink-900 hover:bg-mint-300"
              size="sm"
              onClick={handleCapture}
            >
              <Crosshair size={15} />
              Capture
            </Button>
          </div>
        </div>

        <div className="px-5 pb-4 sm:px-6">
          <div className="mb-2 flex items-center justify-between text-xs text-white/60">
            <span>
              {isWordPhase ? "Word" : "Point"} {stepIndex} of {stepTotal}
            </span>
            <span>
              Overall {Math.min(overallIndex, calibration.totalTargets)} /{" "}
              {calibration.totalTargets}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-mint-500"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      <main className="relative min-h-0 flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(103,203,180,0.08),transparent_55%)]" />

        <div className="absolute inset-0 grid" style={GRID_STYLE}>
          {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => (
            <div key={i} className="border border-white/[0.07]" />
          ))}
        </div>

        {isWordPhase ? (
          <div
            className="absolute inset-0 grid text-[1.2rem] sm:text-[1.4rem] md:text-[1.6rem]"
            style={GRID_STYLE}
          >
            {CALIBRATION_WORDS.map((word, index) => {
              const isActive = index === calibration.currentIndex;
              const isLongWord = word.term.length > 7;

              return (
                <button
                  key={`${word.term}-${word.row}-${word.col}`}
                  type="button"
                  ref={isActive ? activeWordRef : undefined}
                  className={cn(
                    "relative flex items-center justify-center border font-sans transition-colors",
                    isActive
                      ? "z-20 border-mint-400/60 bg-mint-500 text-ink-900 shadow-[0_0_0_4px_rgba(103,203,180,0.25)]"
                      : "z-0 border-transparent bg-transparent text-white/20"
                  )}
                  style={{
                    gridRow: word.row + 1,
                    gridColumn: word.col + 1
                  }}
                  onClick={() => {
                    if (!isActive) return;
                    captureActiveWord();
                  }}
                  aria-label={isActive ? `Capture calibration for ${word.term}` : undefined}
                  aria-current={isActive ? "step" : undefined}
                  disabled={!isActive}
                >
                  <motion.span
                    className={cn(
                      "px-1 text-center font-medium",
                      isLongWord ? "text-[85%]" : "text-[100%]"
                    )}
                    animate={isActive ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                    transition={isActive ? { repeat: Infinity, duration: 1.4 } : undefined}
                  >
                    {word.term}
                  </motion.span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="absolute inset-0 grid" style={GRID_STYLE}>
            <div
              className="relative z-10"
              style={{
                gridRow: targetCell.row + 1,
                gridColumn: targetCell.col + 1
              }}
            >
              <CalibrationTargetDot dotRef={dotRef} onCapture={captureGridTarget} />
            </div>
          </div>
        )}
      </main>

      <footer className="shrink-0 border-t border-white/10 bg-ink-900/95 px-5 py-3 backdrop-blur-md sm:px-6">
        <p className="text-center text-sm text-white/70">
          {isWordPhase ? (
            <>
              Look at the highlighted word{" "}
              <span className="font-semibold text-mint-300">
                {calibration.currentWord?.term}
              </span>
              , then press Capture or click the word.
            </>
          ) : (
            <>
              Look at the{" "}
              <span className="inline-flex items-center gap-1 font-semibold text-mint-300">
                <Target size={14} /> target dot
              </span>
              , then press Capture or click it.
            </>
          )}
        </p>
      </footer>
    </div>
  );
};
