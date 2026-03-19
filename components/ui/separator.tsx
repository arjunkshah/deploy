import * as React from "react";
import { cn } from "@/lib/utils";

const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("shrink-0 border-border", className, !className?.includes("border") ? "border-t" : "")}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

export { Separator };
