import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

export const ReadingRhythm = ({ values }: { values: number[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Reading Rhythm</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex h-36 items-end gap-2">
        {values.map((value, index) => (
          <div
            key={`${value}-${index}`}
            className="flex-1 rounded-full bg-mint-500/70"
            style={{ height: `${value}%` }}
          />
        ))}
      </div>
    </CardContent>
  </Card>
);