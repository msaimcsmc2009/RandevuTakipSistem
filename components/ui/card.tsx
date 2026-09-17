import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "glass" | "flat";

const VARIANT_CLASS: Record<CardVariant, string> = {
  glass: "glass shadow-md",
  flat: "border border-border bg-card/60 shadow-xs",
};

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  elevated?: boolean;
};

export function Card({ className, variant = "glass", elevated = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl text-card-foreground transition-all duration-200 ease-out",
        VARIANT_CLASS[variant],
        elevated && "glass-strong shadow-lg hover:-translate-y-1 hover:shadow-floating",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1 p-5 pb-0", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("font-heading text-sm font-medium text-muted-foreground", className)} {...props} />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-5 pt-0", className)} {...props} />;
}
