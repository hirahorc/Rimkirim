import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Native `<select>` with the browser's default arrow replaced by a custom
 * chevron (properly inset from the edge). `className` styles the wrapper so
 * width constraints (e.g. `sm:max-w-xs`) keep the chevron aligned to the field.
 */
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { wrapperClassName?: string }
>(({ className, wrapperClassName, children, ...props }, ref) => (
  <div className={cn("relative", wrapperClassName)}>
    <select
      ref={ref}
      className={cn(
        "flex h-11 w-full appearance-none rounded-md border border-border bg-surface-2 pl-3 pr-9 text-sm text-foreground transition-colors",
        "focus-visible:outline-none focus-visible:border-brand/70 focus-visible:ring-2 focus-visible:ring-brand/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-2" />
  </div>
));
Select.displayName = "Select";
