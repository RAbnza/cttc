import type { GazePoint } from "../../types/reading";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

export const GazeStream = ({ points }: { points: GazePoint[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Gaze Stream</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex h-40 items-end gap-1 rounded-2xl bg-ink-50 p-4">
        {points.length ? (
          points.slice(-30).map((point, index) => (
            <div
              key={`${point.timestamp}-${index}`}
              className="w-1 rounded-full bg-ink-800/70"
              style={{ height: `${20 + (point.y % 70)}%` }}
            />
          ))
        ) : (
          <p className="text-xs text-ink-400">No gaze samples yet.</p>
        )}
      </div>
    </CardContent>
  </Card>
);