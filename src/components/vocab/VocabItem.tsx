import type { VocabEntry } from "../../types/vocab";
import { Badge } from "../ui/Badge";

export const VocabItem = ({ entry }: { entry: VocabEntry }) => (
  <div className="rounded-2xl border border-ink-100 bg-white/80 p-4 shadow-glass">
    <div className="flex items-center justify-between">
      <h4 className="text-base font-semibold text-ink-900">{entry.term}</h4>
      {entry.pronunciation && <Badge>{entry.pronunciation}</Badge>}
    </div>
    <p className="mt-2 text-sm text-ink-600">{entry.definition}</p>
    {entry.synonyms.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-2">
        {entry.synonyms.map((synonym) => (
          <Badge key={synonym}>{synonym}</Badge>
        ))}
      </div>
    )}
    {entry.examples.length > 0 && (
      <p className="mt-3 text-xs text-ink-500">{entry.examples[0]}</p>
    )}
  </div>
);
