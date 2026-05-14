import { Monitor, Radar, Timer } from "lucide-react";

import { Badge } from "../ui/Badge";

type TopbarProps = {
  sessionStatus: string;
  gazeStatus: string;
  calibrationQuality: number;
};

export const Topbar = ({
  sessionStatus,
  gazeStatus,
  calibrationQuality
}: TopbarProps) => (
  <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/70 px-6 py-4 shadow-soft">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-400">
        Reading Lab
      </p>
      <h2 className="mt-1 text-2xl font-semibold text-ink-900">Realtime Gaze Session</h2>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Badge className="bg-ink-900 text-white">Session {sessionStatus}</Badge>
      <Badge className="flex items-center gap-2">
        <Radar size={14} /> {gazeStatus}
      </Badge>
      <Badge className="flex items-center gap-2">
        <Monitor size={14} /> Webcam
      </Badge>
      <Badge className="flex items-center gap-2">
        <Timer size={14} /> Focus Mode
      </Badge>
      <Badge className="flex items-center gap-2 bg-mint-100 text-mint-700">
        Calibration {calibrationQuality}%
      </Badge>
    </div>
  </header>
);
