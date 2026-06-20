import { RotateCcw } from "lucide-react";
import { useMemo } from "react";

import type { ReadingSession } from "../../types/reading";
import { cn } from "../../utils/cn";
import { downloadCsvFile, downloadJsonFile } from "../../utils/download";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { DownloadMenu } from "../ui/DownloadMenu";

type LatestSessionRereadListProps = {
  session: ReadingSession | null;
};

export const LatestSessionRereadList = ({ session }: LatestSessionRereadListProps) => {
  const exportRows = useMemo(
    () =>
      session?.wordMetrics.map((word) => ({
        wordIndex: word.wordIndex + 1,
        lineIndex: word.lineIndex + 1,
        word: word.term,
        rereads: word.rereads
      })) ?? [],
    [session]
  );

  const baseFileName = session ? `latest-word-rereads-${session.id}` : "latest-word-rereads";

  return (
    <Card className="p-0">
      <CardHeader className="flex-col gap-4 border-b border-ink-100 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <CardTitle>Latest Word Re-Reads</CardTitle>
          <CardDescription className="mt-1 max-w-xl">
            Shows how often previously seen words are revisited during the latest session.
          </CardDescription>
        </div>
        <DownloadMenu
          className="self-start"
          disabled={!session}
          options={[
            {
              label: "Download CSV",
              onSelect: () => downloadCsvFile(exportRows, `${baseFileName}.csv`)
            },
            {
              label: "Download JSON",
              onSelect: () =>
                downloadJsonFile(
                  {
                    sessionId: session?.id ?? null,
                    exportedAt: new Date().toISOString(),
                    rows: exportRows
                  },
                  `${baseFileName}.json`
                )
            }
          ]}
        />
      </CardHeader>
      <CardContent className="mt-0 px-0 py-0">
        {session ? (
          <div className="max-h-[28rem] overflow-y-auto">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 border-b border-ink-100 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <span>Word</span>
              <span>Re-reads</span>
            </div>
            {session.wordMetrics.map((word) => (
              <div
                key={word.wordIndex}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 border-b border-ink-100/80 px-6 py-3 last:border-b-0"
              >
                <span className="truncate text-sm font-medium text-ink-900">{word.term}</span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
                    word.rereads > 0 ? "bg-amber-50 text-amber-700" : "bg-ink-100 text-ink-500"
                  )}
                >
                  {word.rereads}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-3 px-6 py-5 text-sm text-ink-500">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-500">
              <RotateCcw size={18} />
            </div>
            <p>No completed reading session yet. Finish one to see per-word re-read counts.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
