import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

export const ConfusionList = ({ words }: { words: string[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Confusion Signals</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-2">
        {words.length ? (
          words.map((word) => (
            <span
              key={word}
              className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-3 py-1 text-xs font-semibold text-white"
            >
              <AlertTriangle size={12} /> {word}
            </span>
          ))
        ) : (
          <p className="text-sm text-ink-500">No confusion detected yet.</p>
        )}
      </div>
    </CardContent>
  </Card>
);