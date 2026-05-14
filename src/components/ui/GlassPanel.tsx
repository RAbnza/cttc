import * as React from "react";

import { cn } from "../../utils/cn";

export const GlassPanel = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("glass-panel rounded-2xl p-6", className)} {...props} />
);
