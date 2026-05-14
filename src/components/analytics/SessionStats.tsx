import type { ReadingSession } from "../../types/reading";
import { formatPercent } from "../../utils/format";
import { Card } from "../ui/Card";

export const SessionStats = ({ session }: { session: ReadingSession }) => (
  <Card className="flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <p className="text-sm text-ink-500">Progress</p>
      <p className="text-lg font-semibold text-ink-900">
        {formatPercent(session.progressPercent)}
      </p>
    </div>
    <div className="space-y-2">
      <div className="h-2 rounded-full bg-ink-100">
        <div
          className="h-2 rounded-full bg-ink-900 transition"
          style={{ width: `${session.progressPercent}%` }}
        />
      </div>
      <p className="text-xs text-ink-500">Session id: {session.id}</p>
    </div>
  </Card>
);