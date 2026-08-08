"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/** Small icon button that copies `value` to the clipboard with brief feedback. */
export function CopyButton({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const t = useT();
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(t("order.copied"));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={t("order.copy")}
      className={cn(
        "inline-grid size-7 shrink-0 place-items-center rounded-sm text-muted transition-colors hover:bg-surface-3 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50",
        className,
      )}
    >
      {copied ? (
        <Check className="size-4 text-success" strokeWidth={3} />
      ) : (
        <Copy className="size-4" />
      )}
    </button>
  );
}
