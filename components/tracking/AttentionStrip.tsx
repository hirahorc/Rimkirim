"use client";

import { MessageCircle } from "lucide-react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import {
  ACTION_ATTENTION,
  POSITIVE_ATTENTION,
  DARK_ATTENTION,
} from "@/lib/order/attention";
import { useT } from "@/lib/i18n/LanguageProvider";
import { CardStrip, stripInk, type CardStripProps } from "@/components/ui/card-strip";
import { cn } from "@/lib/utils/cn";
import { WA_URL } from "@/lib/contact";

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

/* Solid glyphs: the strip's icon is an anchor, not a diagram, so it reads as
   a filled shape on the tint (the summary's small metadata icons stay line). */
const ICON = {
  positive: CheckCircleIcon,
  action: ExclamationCircleIcon,
  hold: ExclamationTriangleIcon,
} as const;

/**
 * The attention state, worn as the head of the card it explains (The
 * Attached-Strip Rule): the sentence itself is the headline — no "needs
 * attention" label, the tint already says that. null = on track.
 */
export function AttentionStrip({
  attention,
  inset,
}: {
  attention: string | null;
  inset?: CardStripProps["inset"];
}) {
  const t = useT();
  if (!attention) return null;
  // three voices (The Whose-Move Rule): green reports progress, purple says
  // the ball is in the customer's court, orange says the shipment is held
  // and someone else is on it
  const tone = POSITIVE_ATTENTION.has(attention)
    ? "positive"
    : ACTION_ATTENTION.has(attention)
      ? "action"
      : "hold";
  const explain = EXPLAIN[attention];
  return (
    // keyed by state so a state change re-plays the one-time entrance
    <CardStrip key={attention} edge="top" tone={tone} inset={inset} icon={ICON[tone]} className="banner-enter">
      <p className={cn("font-medium", stripInk(tone))}>{t(attention)}</p>
      {explain && <p className="mt-1 text-xs text-muted">{t(explain)}</p>}
      {DARK_ATTENTION.has(attention) && (
        <a
          href={WA_URL}
          target="_blank"
          rel="noreferrer"
          className="link-mark tap-row relative mt-2 inline-flex items-center gap-1.5 text-sm font-medium"
        >
          <MessageCircle className="size-4" /> {t("order.contactWa")}
        </a>
      )}
    </CardStrip>
  );
}
