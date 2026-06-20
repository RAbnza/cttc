import type { VocabEntry } from "../../types/vocab";
import type { ReadingSession } from "../../types/reading";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { VocabItem } from "./VocabItem";

type VocabPanelProps = {
  entries: VocabEntry[];
  session: ReadingSession | null;
};

export const VocabPanel = ({ entries, session }: VocabPanelProps) => (
  <Card className="p-0">
    <CardHeader className="border-b border-ink-100 px-6 py-5">
      <div>
        <CardTitle>Vocabulary Assistance</CardTitle>
        <CardDescription>
          Definitions for words that drew extra attention during reading.
        </CardDescription>
      </div>
      {entries.length > 0 && (
        <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-600">
          {entries.length} word{entries.length === 1 ? "" : "s"}
        </span>
      )}
    </CardHeader>
    <CardContent className="mt-0 px-6 py-5">
      {entries.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {entries.map((entry) => (
            <VocabItem key={entry.term} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50/40 px-6 py-10 text-center">
          <BookOpen size={24} className="text-ink-300" />
          <p className="mt-3 text-sm font-medium text-ink-700">
            {session ? "No difficult words yet" : "No completed reading session yet"}
          </p>
          <p className="mt-1 max-w-sm text-xs text-ink-500">
            {session
              ? "Words with long fixations or re-reads will appear here with definitions."
              : "Finish a reading session to see vocabulary assistance for difficult words."}
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);
