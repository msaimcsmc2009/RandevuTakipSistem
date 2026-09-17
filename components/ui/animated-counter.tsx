"use client";

import { useCountUp } from "@/hooks/use-count-up";

type AnimatedCounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  decimals?: number;
};

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  durationMs = 900,
  decimals = 0,
}: AnimatedCounterProps) {
  const animated = useCountUp(value, durationMs);
  const formatted = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(animated);

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
