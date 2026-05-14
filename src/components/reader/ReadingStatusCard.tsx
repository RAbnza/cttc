import { Brain, Sparkles } from "lucide-react";

import type { ReadingStatus } from "../../types/reading";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

const statusLabel: Record<ReadingStatus, string> = {
  idle: "Waiting to start",
  calibrating: "Calibrating gaze",
  tracking: "Tracking gaze",
  paused: "Paused",
  complete: "Session complete"
};

export const ReadingStatusCard = ({ status }: { status: ReadingStatus }) => (
  <Card>
    <CardHeader>
      <CardTitle>Session Status</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between rounded-2xl border border-ink-100 bg-white/80 p-4">
        <div>
          <p className="text-sm text-ink-500">Status</p>
          <p className="mt-1 text-lg font-semibold text-ink-900">{statusLabel[status]}</p>
        </div>
        <div className="flex gap-2 text-ink-500">
          <Brain />
          <Sparkles />
        </div>
      </div>
    </CardContent>
  </Card>
);