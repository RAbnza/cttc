import * as React from "react";

import { cn } from "../../utils/cn";

export const Badge = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border border-ink-200 bg-white/70 px-3 py-1 text-xs font-semibold text-ink-600",
      className
    )}
    {...props}
  />
);
