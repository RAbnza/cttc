import type { VocabEntry } from "../../types/vocab";
import { Badge } from "../ui/Badge";

export const VocabItem = ({ entry }: { entry: VocabEntry }) => (
  <div className="rounded-xl border border-ink-100 bg-white p-4">
    <div className="flex items-start justify-between gap-2">
      <h4 className="text-sm font-semibold text-ink-900">{entry.term}</h4>
      {entry.pronunciation && (
        <Badge className="shrink-0 text-[10px]">{entry.pronunciation}</Badge>
      )}
    </div>
    <p className="mt-2 text-sm leading-relaxed text-ink-600">{entry.definition}</p>
    {entry.synonyms.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-1.5">
        {entry.synonyms.slice(0, 4).map((synonym) => (
          <Badge key={synonym} className="bg-ink-50 text-ink-600">
            {synonym}
          </Badge>
        ))}
      </div>
    )}
    {entry.examples.length > 0 && (
      <p className="mt-3 border-t border-ink-100 pt-3 text-xs italic text-ink-500">
        {entry.examples[0]}
      </p>
    )}
  </div>
);
