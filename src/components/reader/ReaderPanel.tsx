import { Camera, CheckCircle2, Circle, PauseCircle, PlayCircle, Target } from "lucide-react";

import type { ReadingSession } from "../../types/reading";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";

type ReaderPanelProps = {
  session: ReadingSession;
  cameraEnabled: boolean;
  cameraReady: boolean;
  onStartCalibration: () => void;
  onStartReading: () => void;
  onRestartCalibration: () => void;
  onPause: () => void;
  onResume: () => void;
};

const statusLabel: Record<ReadingSession["status"], string> = {
  idle: "Ready",
  calibrating: "Calibrating",
  tracking: "Reading",
  paused: "Paused",
  complete: "Complete"
};

export const ReaderPanel = ({
  session,
  cameraEnabled,
  cameraReady,
  onStartCalibration,
  onStartReading,
  onRestartCalibration,
  onPause,
  onResume
}: ReaderPanelProps) => {
  const isTracking = session.status === "tracking";
  const isCalibrating = session.status === "calibrating";
  const isIdle = session.status === "idle" || session.status === "complete";
  const isCalibrated = session.calibration.completed;
  const sessionBlocked = !cameraEnabled || !cameraReady;

  const steps = [
    {
      label: "Camera",
      done: cameraEnabled && cameraReady,
      active: !cameraReady
    },
    {
      label: "Calibrate",
      done: isCalibrated,
      active: cameraReady && !isCalibrated
    },
    {
      label: "Read",
      done: session.status === "complete",
      active: isCalibrated && isIdle
    }
  ];

  return (
    <Card className="p-0">
      <CardHeader className="border-b border-ink-100 px-6 py-5">
        <div>
          <CardTitle>Reading Session</CardTitle>
          <CardDescription>
            Calibrate gaze tracking, then read the story in full screen.
          </CardDescription>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
            isTracking && "bg-mint-100 text-mint-700",
            isCalibrating && "bg-amber-100 text-amber-800",
            isIdle && "bg-ink-100 text-ink-600",
            session.status === "paused" && "bg-ink-200 text-ink-700",
            session.status === "complete" && "bg-ink-800 text-white"
          )}
        >
          {statusLabel[session.status]}
        </span>
      </CardHeader>

      <CardContent className="mt-0 space-y-6 px-6 py-5">
        <ol className="grid grid-cols-3 gap-3">
          {steps.map((step) => (
            <li
              key={step.label}
              className={cn(
                "rounded-xl border px-3 py-3 text-center",
                step.done && "border-mint-200 bg-mint-50",
                step.active && !step.done && "border-ink-300 bg-white",
                !step.done && !step.active && "border-ink-100 bg-ink-50/60"
              )}
            >
              <div className="mb-1 flex justify-center">
                {step.done ? (
                  <CheckCircle2 size={18} className="text-mint-700" />
                ) : (
                  <Circle
                    size={18}
                    className={step.active ? "text-ink-700" : "text-ink-300"}
                  />
                )}
              </div>
              <p className="text-xs font-semibold text-ink-800">{step.label}</p>
            </li>
          ))}
        </ol>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-ink-100 bg-ink-50/50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Calibration
            </p>
            <p className="mt-1 text-sm font-medium text-ink-900">
              {isCalibrated
                ? `${session.calibration.qualityScore}% overall`
                : "Not completed"}
            </p>
            {isCalibrated && (
              <p className="mt-0.5 text-xs text-ink-500">
                Grid {session.calibration.gridQualityScore}% · Words{" "}
                {session.calibration.wordQualityScore}%
              </p>
            )}
          </div>
          <div className="rounded-xl border border-ink-100 bg-ink-50/50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Current word
            </p>
            <p className="mt-1 truncate text-sm font-medium text-ink-900">
              {session.currentWord?.term || "—"}
            </p>
            {session.progressPercent > 0 && (
              <p className="mt-0.5 text-xs text-ink-500">
                {session.progressPercent}% through story
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isIdle ? (
            <>
              <Button
                variant="outline"
                onClick={onStartCalibration}
                disabled={sessionBlocked}
                title={
                  sessionBlocked
                    ? "Enable and connect the camera first"
                    : undefined
                }
              >
                <Target size={16} /> Calibrate
              </Button>
              <Button
                onClick={onStartReading}
                disabled={sessionBlocked || !isCalibrated}
                title={
                  !cameraEnabled
                    ? "Turn on the camera first"
                    : !cameraReady
                      ? "Waiting for camera"
                      : !isCalibrated
                        ? "Complete calibration first"
                        : undefined
                }
              >
                <PlayCircle size={16} /> Start Reading
              </Button>
            </>
          ) : isCalibrating ? (
            <Button variant="outline" disabled>
              <Target size={16} /> Calibrating…
            </Button>
          ) : isTracking ? (
            <>
              <Button variant="outline" onClick={onPause}>
                <PauseCircle size={16} /> Pause
              </Button>
              <Button variant="ghost" onClick={onRestartCalibration}>
                <Target size={16} /> Recalibrate
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onResume}>
                <PlayCircle size={16} /> Resume
              </Button>
              <Button variant="ghost" onClick={onRestartCalibration}>
                <Target size={16} /> Recalibrate
              </Button>
            </>
          )}
        </div>

        {sessionBlocked && isIdle && (
          <div className="flex items-start gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-600">
            <Camera size={16} className="mt-0.5 shrink-0 text-ink-400" />
            <p>
              {!cameraEnabled
                ? "Camera is off. Turn it on in the webcam panel before calibrating or reading."
                : "Camera is starting up. Actions unlock once the feed is live."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
