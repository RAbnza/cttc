import { BookOpenText, Clock, Sparkles, Undo2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { formatMs, formatPercent } from "../../utils/format";

type FixationMetricProps = {
  averageFixationMs: number;
  wordsRead: number;
  totalWords: number;
  totalTimeMs: number;
  difficultCount: number;
  rereadCount: number;
};

export const FixationMetric = ({
  averageFixationMs,
  wordsRead,
  totalWords,
  totalTimeMs,
  difficultCount,
  rereadCount
}: FixationMetricProps) => {
  const coveragePercent = totalWords ? (wordsRead / totalWords) * 100 : 0;

  const supportingMetrics = [
    {
      label: "Focus time",
      value: totalWords ? formatMs(totalTimeMs) : "--",
      icon: <Clock size={16} />
    },
    {
      label: "Coverage",
      value: totalWords ? formatPercent(coveragePercent) : "--",
      icon: <BookOpenText size={16} />
    },
    {
      label: "Re-reads",
      value: totalWords ? String(rereadCount) : "--",
      icon: <Undo2 size={16} />
    },
    {
      label: "Difficult words",
      value: totalWords ? String(difficultCount) : "--",
      icon: <Sparkles size={16} />
    }
  ];

  return (
    <Card className="p-5">
      <CardHeader className="items-center gap-0">
        <CardTitle className="text-base">Avg. Fixation</CardTitle>
        <CardDescription>Per-word gaze duration</CardDescription>
      </CardHeader>
      <CardContent className="mt-3 space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-semibold tabular-nums tracking-tight text-ink-900">
              {totalWords ? averageFixationMs : "--"}
              {totalWords > 0 && (
                <span className="ml-1 text-lg font-medium text-ink-400">ms</span>
              )}
            </p>
            <p className="mt-1 text-xs text-ink-500">
              {totalWords
                ? `${wordsRead} of ${totalWords} words received gaze data in the latest session`
                : "Complete a reading session to view fixation and pacing insights"}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-100 text-ink-600">
            <Clock size={22} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {supportingMetrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-ink-100 bg-ink-50/70 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3 text-ink-500">
                <p className="text-xs font-medium uppercase tracking-[0.18em]">
                  {metric.label}
                </p>
                {metric.icon}
              </div>
              <p className="mt-2 text-xl font-semibold text-ink-900">{metric.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
