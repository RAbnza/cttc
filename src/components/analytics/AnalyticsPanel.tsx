import { Activity, Sigma, Sparkles, Timer } from "lucide-react";

import type { ReadingAnalytics } from "../../types/reading";
import { formatMs } from "../../utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { ProgressRing } from "../ui/ProgressRing";
import { MetricTile } from "./MetricTile";

type AnalyticsPanelProps = {
  analytics: ReadingAnalytics;
  progressPercent: number;
};

export const AnalyticsPanel = ({ analytics, progressPercent }: AnalyticsPanelProps) => (
  <Card>
    <CardHeader>
      <div>
        <CardTitle>Reading Analytics</CardTitle>
        <p className="mt-1 text-sm text-ink-500">Live comprehension and pacing overview.</p>
      </div>
      <ProgressRing value={progressPercent} />
    </CardHeader>
    <CardContent>
      <div className="grid gap-4 md:grid-cols-2">
        <MetricTile
          label="Focus time"
          value={formatMs(analytics.totalTimeMs)}
          icon={<Timer size={20} />}
        />
        <MetricTile
          label="Words mapped"
          value={String(analytics.wordsRead)}
          icon={<Activity size={20} />}
        />
        <MetricTile
          label="Avg fixation"
          value={formatMs(analytics.averageFixationMs)}
          icon={<Sigma size={20} />}
        />
        <MetricTile
          label="Difficult terms"
          value={String(analytics.difficultCount)}
          icon={<Sparkles size={20} />}
          tone="accent"
        />
      </div>
    </CardContent>
  </Card>
);