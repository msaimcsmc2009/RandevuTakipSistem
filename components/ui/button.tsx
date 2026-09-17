"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-b from-primary-glow to-primary text-primary-foreground shadow-glow-primary hover:shadow-glow-primary-lg hover:brightness-105 active:brightness-95",
  secondary:
    "glass text-foreground hover:border-white/[0.14] hover:bg-white/[0.06] active:brightness-95",
  outline: "border border-border text-foreground hover:bg-white/5 active:bg-white/10",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-white/5",
  destructive: "bg-destructive/90 text-destructive-foreground hover:bg-destructive shadow-xs",
  success:
    "bg-success text-success-foreground shadow-glow-success hover:brightness-110 active:brightness-95",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 ease-out active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0",
          VARIANT_CLASS[variant],
          SIZE_CLASS[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
