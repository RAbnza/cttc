import * as React from "react";

import { cn } from "../../utils/cn";

export const AppShell = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("app-shell min-h-screen", className)} {...props} />
);
