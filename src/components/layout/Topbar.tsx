import { Camera, Radar } from "lucide-react";

import type { ReadingStatus } from "../../types/reading";
import { cn } from "../../utils/cn";
import { Badge } from "../ui/Badge";

type TopbarProps = {
  sessionStatus: ReadingStatus;
  gazeStatus: string;
  calibrationQuality: number;
  cameraEnabled: boolean;
  isCalibrated: boolean;
};

const sessionTone: Record<ReadingStatus, string> = {
  idle: "bg-ink-100 text-ink-700",
  calibrating: "bg-amber-100 text-amber-800",
  tracking: "bg-mint-100 text-mint-700",
  paused: "bg-ink-200 text-ink-800",
  complete: "bg-ink-800 text-white"
};

export const Topbar = ({
  sessionStatus,
  gazeStatus,
  calibrationQuality,
  cameraEnabled,
  isCalibrated
}: TopbarProps) => (
  <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-200/80 pb-5">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-400">
        CTTC Gaze Reader
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
        Reading Dashboard
      </h1>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Badge className={cn("capitalize", sessionTone[sessionStatus])}>
        {sessionStatus}
      </Badge>
      <Badge className="flex items-center gap-1.5 bg-white text-ink-600 ring-1 ring-ink-200">
        <Radar size={13} />
        {gazeStatus}
      </Badge>
      <Badge
        className={cn(
          "flex items-center gap-1.5",
          cameraEnabled ? "bg-mint-50 text-mint-700 ring-1 ring-mint-200" : "bg-ink-100 text-ink-500"
        )}
      >
        <Camera size={13} />
        {cameraEnabled ? "Camera on" : "Camera off"}
      </Badge>
      {isCalibrated && (
        <Badge className="bg-ink-900 text-white">
          Calibrated {calibrationQuality}%
        </Badge>
      )}
    </div>
  </header>
);
