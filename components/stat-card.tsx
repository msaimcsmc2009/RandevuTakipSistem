import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  icon: LucideIcon;
  value?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  display?: string;
  hint?: string;
  className?: string;
};

export function StatCard({
  label,
  icon: Icon,
  value,
  decimals = 0,
  prefix,
  suffix,
  display,
  hint,
  className,
}: StatCardProps) {
  return (
    <Card elevated className={cn("group relative overflow-hidden p-5", className)}>
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary transition-colors group-hover:bg-primary/25">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-heading text-2xl font-semibold text-foreground">
        {display !== undefined ? (
          display
        ) : (
          <AnimatedCounter value={value ?? 0} decimals={decimals} prefix={prefix} suffix={suffix} />
        )}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}
