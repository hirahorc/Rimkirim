"use client";

import { AlertTriangle, CheckCircle2, MessageCircle } from "lucide-react";
import {
  POSITIVE_ATTENTION,
  DARK_ATTENTION,
} from "@/lib/order/attention";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

const WA_URL = "https://wa.me/6281234567890";

/* Customs jargon explained in place — one plain sentence right where the
   unfamiliar term (and the anxiety) appears. */
const EXPLAIN: Record<string, string> = {
  "order.attAwbIssued": "order.jargAwb",
  "order.attNeedsNewAwb": "order.jargAwb",
  "order.attAwbChanged": "order.jargAwb",
  "order.attClearanceBarpin": "order.jargBarpin",
  "order.attClearanceBarpinRevision": "order.jargBarpin",
  "order.attNpd": "order.jargNpd",
  "order.attClearanceTax": "order.jargSptnp",
  "order.attClearanceReleasedExtra": "order.jargSppbl",
};

/**
 * Attention overlay slot. Renders when an order carries an active attention
 * state (an i18n key set by the ops simulator in later steps); null = on track.
 */
export function AttentionBanner({ attention }: { attention: string | null }) {
  const t = useT();
  if (!attention) return null;
  const positive = POSITIVE_ATTENTION.has(attention);
  const Icon = positive ? CheckCircle2 : AlertTriangle;
  const explain = EXPLAIN[attention];
  return (
    // keyed by state so a state change re-plays the one-time entrance
    <Card
      key={attention}
      className={cn(
        "banner-enter rounded-md flex items-start gap-3 p-4 sm:p-5",
        positive ? "border-success/40 bg-success/10" : "border-warning/40 bg-warning/10",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          positive ? "text-success" : "text-warning",
        )}
      />
      <div>
        <p
          className={cn(
            "text-sm font-semibold",
            positive ? "text-success" : "text-warning",
          )}
        >
          {t(positive ? "order.tdGoodNews" : "order.tdAttention")}
        </p>
        <p className="mt-0.5 text-sm text-foreground">{t(attention)}</p>
        {explain && <p className="mt-1 text-xs text-muted">{t(explain)}</p>}
        {DARK_ATTENTION.has(attention) && (
          <a
            href={WA_URL}
            target="_blank"
            rel="noreferrer"
            className="link-mark mt-2 inline-flex items-center gap-1.5 text-sm font-medium"
          >
            <MessageCircle className="size-4" /> {t("order.contactWa")}
          </a>
        )}
      </div>
    </Card>
  );
}
