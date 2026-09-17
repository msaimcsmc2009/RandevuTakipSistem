import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral";

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  default: "bg-primary/15 text-primary border border-primary/25",
  success: "bg-success/15 text-success border border-success/25",
  warning: "bg-warning/15 text-warning border border-warning/25",
  danger: "bg-destructive/15 text-destructive border border-destructive/25",
  info: "bg-info/15 text-info border border-info/25",
  neutral: "bg-muted text-muted-foreground border border-border",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        VARIANT_CLASS[variant],
        className
      )}
      {...props}
    />
  );
}
