import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground",
        "placeholder:text-muted-2 transition-colors",
        "focus-visible:outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

/** Multi-line text field, styled to match Input (taller, resizable vertically). */
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 3, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "flex min-h-24 w-full resize-y rounded-md border border-border bg-surface-2 px-3 py-2 text-sm leading-relaxed text-foreground",
        "placeholder:text-muted-2 transition-colors",
        "focus-visible:outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-xs font-medium text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-danger">{children}</p>;
}
