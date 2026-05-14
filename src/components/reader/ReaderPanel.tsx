import { Eye, PauseCircle, PlayCircle } from "lucide-react";

import type { ReadingSession } from "../../types/reading";
import type { WordRect } from "../../types/reading";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { StoryText } from "./StoryText";

type ReaderPanelProps = {
  session: ReadingSession;
  lines: string[];
  onWordLayout?: (rects: WordRect[]) => void;
  onStart: () => void;
  onRestartCalibration: () => void;
  onPause: () => void;
  onResume: () => void;
};

export const ReaderPanel = ({
  session,
  lines,
  onWordLayout,
  onStart,
  onRestartCalibration,
  onPause,
  onResume
}: ReaderPanelProps) => {
  const isTracking = session.status === "tracking";
  const isCalibrating = session.status === "calibrating";
  const isIdle = session.status === "idle" || session.status === "complete";

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Story Focus</CardTitle>
          <p className="mt-1 text-sm text-ink-500">
            Live gaze mapping highlights the current word.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isIdle ? (
            <Button size="sm" onClick={onStart}>
              <PlayCircle size={16} /> Start calibration
            </Button>
          ) : isCalibrating ? (
            <Button size="sm" variant="outline" disabled>
              <PlayCircle size={16} /> Calibrating
            </Button>
          ) : isTracking ? (
            <>
              <Button size="sm" variant="outline" onClick={onPause}>
                <PauseCircle size={16} /> Pause
              </Button>
              <Button size="sm" variant="ghost" onClick={onRestartCalibration}>
                <PlayCircle size={16} /> Restart calibration
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={onResume}>
                <PlayCircle size={16} /> Resume
              </Button>
              <Button size="sm" variant="ghost" onClick={onRestartCalibration}>
                <PlayCircle size={16} /> Start calibration
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-ink-100 bg-white/80 px-4 py-3 text-base text-ink-600">
          <Eye size={20} className="shrink-0 text-ink-500" />
          Current word:{" "}
          <span className="font-semibold text-ink-900">
            {session.currentWord?.term || "--"}
          </span>
        </div>
        <div
          className="overflow-y-auto overscroll-y-contain rounded-2xl border border-ink-100 bg-white/90 px-3 py-5 shadow-inner sm:px-5 [--story-line:2.35rem] md:[--story-line:2.65rem]"
          style={{
            maxHeight:
              "min(65vh, calc(5 * var(--story-line) + 4 * 1.1rem + 2.25rem))"
          }}
        >
          <StoryText
            lines={lines}
            currentWord={session.currentWord}
            onLayout={onWordLayout}
          />
        </div>
      </CardContent>
    </Card>
  );
};
