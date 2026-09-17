import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "glass-subtle h-10 w-full rounded-lg px-3 text-sm text-foreground outline-none transition-all duration-200 focus:border-primary focus:shadow-glow-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
