import type { VocabEntry } from "../../types/vocab";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { VocabItem } from "./VocabItem";

type VocabPanelProps = {
  entries: VocabEntry[];
};

export const VocabPanel = ({ entries }: VocabPanelProps) => (
  <Card>
    <CardHeader>
      <div>
        <CardTitle>Vocabulary Assistance</CardTitle>
        <p className="mt-1 text-sm text-ink-500">
          Definitions and examples based on attention spikes.
        </p>
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid gap-4">
        {entries.length ? (
          entries.map((entry) => <VocabItem key={entry.term} entry={entry} />)
        ) : (
          <div className="rounded-2xl border border-dashed border-ink-200 p-6 text-sm text-ink-500">
            Start a reading session to surface difficult words.
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);