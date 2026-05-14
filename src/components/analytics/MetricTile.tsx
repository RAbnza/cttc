import type { ReactNode } from "react";

import { cn } from "../../utils/cn";

type MetricTileProps = {
  label: string;
  value: string;
  icon?: ReactNode;
  tone?: "default" | "accent";
};

export const MetricTile = ({ label, value, icon, tone = "default" }: MetricTileProps) => (
  <div
    className={cn(
      "flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-5 py-4 text-sm shadow-glass",
      tone === "accent" && "bg-ink-900 text-white"
    )}
  >
    <div>
      <p className={cn("text-xs font-semibold uppercase tracking-[0.2em]", tone === "accent" && "text-white/70")}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
    {icon && <div className="text-2xl">{icon}</div>}
  </div>
);
