import { forwardRef } from "react";
import type { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "glass-subtle h-10 w-full rounded-lg px-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:shadow-glow-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "glass-subtle w-full rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:shadow-glow-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-medium text-foreground", className)} {...props} />;
}
