"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={copy}
      aria-label={t("order.copy")}
      className={cn("tap-target relative shrink-0 rounded-sm", className)}
    >
      {copied ? (
        <Check className="text-success" strokeWidth={3} />
      ) : (
        <Copy />
      )}
    </Button>
  );
}
