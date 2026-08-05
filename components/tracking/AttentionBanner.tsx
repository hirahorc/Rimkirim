"use client";

import { AlertTriangle } from "lucide-react";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";

/**
 * Attention overlay slot. Renders when an order carries an active attention
 * state (an i18n key set by the ops simulator in later steps); null = on track.
 */
export function AttentionBanner({ attention }: { attention: string | null }) {
  const t = useT();
  if (!attention) return null;
  return (
    <Card className="mt-4 flex items-start gap-3 border-warning/40 bg-warning/10 p-4 sm:p-5">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
      <div>
        <p className="text-sm font-semibold text-warning">{t("order.tdAttention")}</p>
        <p className="mt-0.5 text-sm text-foreground">{t(attention)}</p>
      </div>
    </Card>
  );
}
