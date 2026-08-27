"use client";

import * as React from "react";
import { ShieldCheck, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LegalBody } from "@/components/legal/LegalDoc";
import { termsDoc, privacyDoc } from "@/components/legal/legal-content";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

type DocKey = "terms" | "privacy";
const DOCS: { key: DocKey; doc: typeof termsDoc }[] = [
  { key: "terms", doc: termsDoc },
  { key: "privacy", doc: privacyDoc },
];

/**
 * Shown before an order is created: the user must read (scroll to the bottom
 * of) BOTH the Terms of Service and the Privacy Policy — one tab each — and
 * tick the agreement checkbox before "Agree & Book" is enabled. Gates both
 * BFG and Moving Abroad.
 */
export function BookingAgreementDialog({
  open,
  onOpenChange,
  onAgree,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* radix unmounts the content when closed, so the gate state below
          starts fresh on every open without an effect */}
      <AgreementContent
        onCancel={() => onOpenChange(false)}
        onAgree={onAgree}
      />
    </Dialog>
  );
}

function AgreementContent({
  onCancel,
  onAgree,
}: {
  onCancel: () => void;
  onAgree: () => void;
}) {
  const t = useT();
  const { locale } = useLanguage();
  const loc = locale as "id" | "en";
  const tx = (l: { id: string; en: string }) => (loc === "en" ? l.en : l.id);

  const [active, setActive] = React.useState<DocKey>("terms");
  const [read, setRead] = React.useState<Record<DocKey, boolean>>({
    terms: false,
    privacy: false,
  });
  const [progress, setProgress] = React.useState(0);
  const [agreed, setAgreed] = React.useState(false);
  const regionRef = React.useRef<HTMLDivElement>(null);

  const measure = React.useCallback(
    (el: HTMLDivElement | null, key: DocKey) => {
      if (!el) return;
      const max = el.scrollHeight - el.clientHeight;
      const ratio = max <= 0 ? 1 : Math.min(1, el.scrollTop / max);
      setProgress(ratio);
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
        setRead((r) => (r[key] ? r : { ...r, [key]: true }));
      }
    },
    [],
  );

  // a new tab starts at the top; a doc that fits without scrolling counts as read
  React.useLayoutEffect(() => {
    const el = regionRef.current;
    if (!el) return;
    el.scrollTop = 0;
    measure(el, active);
  }, [active, measure]);

  const allRead = read.terms && read.privacy;
  const activeDoc = DOCS.find((d) => d.key === active)!;
  const unread = DOCS.find((d) => !read[d.key]);
  const hint = allRead
    ? t("order.baAllRead")
    : !read.terms && !read.privacy
      ? t("order.baScrollHint")
      : t("order.baNextDoc").replace("{doc}", tx(unread!.doc.title));

  return (
    <DialogContent
      // land keyboard focus on the reading region, not on "Cancel"
      onOpenAutoFocus={(e) => {
        e.preventDefault();
        regionRef.current?.focus({ preventScroll: true });
      }}
    >
      <DialogHeader className="flex flex-row items-start gap-3 p-5 pb-3 sm:p-6 sm:pb-3 sm:pr-16">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-surface-3">
          <ShieldCheck className="size-[1.125rem]" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <DialogTitle>{t("order.baTitle")}</DialogTitle>
          <DialogDescription>{t("order.baSubtitle")}</DialogDescription>
        </div>
      </DialogHeader>

      {/* one tab per document; a tick marks the ones already read to the end */}
      <div
        role="tablist"
        aria-label={t("order.baTitle")}
        className="flex shrink-0 gap-1 px-5 sm:px-6"
      >
        {DOCS.map(({ key, doc }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              id={`ba-tab-${key}`}
              aria-selected={isActive}
              aria-controls="ba-region"
              onClick={() => setActive(key)}
              className={cn(
                "-mb-px inline-flex min-h-11 items-center gap-1.5 border-b-2 px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/50",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-2 hover:text-foreground",
              )}
            >
              {tx(doc.title)}
              {read[key] && (
                <span className="grid size-4 place-items-center rounded-full bg-brand text-brand-ink">
                  <Check className="size-2.5" strokeWidth={3.5} />
                  <span className="sr-only"> ({t("order.baDocRead")})</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* reading region: keyboard-scrollable, with a thin read-progress rule
            along the top edge and a fade at the foot while there is more below */}
      <div className="relative flex min-h-0 flex-1 flex-col border-y border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 bg-foreground transition-[width] duration-150 ease-out"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
        <div
          ref={regionRef}
          id="ba-region"
          role="tabpanel"
          aria-labelledby={`ba-tab-${active}`}
          tabIndex={0}
          onScroll={(e) => measure(e.currentTarget, active)}
          className={cn(
            "scroll-thin min-h-0 flex-1 overflow-y-auto px-5 py-6 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/25 sm:px-6",
            progress < 0.98 &&
              "[mask-image:linear-gradient(to_bottom,black_calc(100%-3.5rem),transparent)]",
          )}
        >
          <LegalBody doc={activeDoc.doc} locale={loc} embed />
        </div>
      </div>

      {/* the gate's own state (hint + checkbox) sits above the action row;
          the buttons live in DialogFooter like every other action dialog */}
      <div className="shrink-0 space-y-2 px-5 pt-3 sm:px-6">
        <p
          aria-live="polite"
          className={cn(
            "text-xs",
            allRead ? "text-foreground" : "text-muted-2",
          )}
        >
          {hint}
        </p>
        <label
          className={cn(
            "flex min-h-11 cursor-pointer items-start gap-2.5 py-2 text-sm leading-snug text-muted",
            !allRead && "cursor-not-allowed opacity-50",
          )}
        >
          <Checkbox
            checked={agreed}
            onCheckedChange={(v) => setAgreed(Boolean(v))}
            disabled={!allRead}
          />
          <span>{t("order.baCheckbox")}</span>
        </label>
      </div>
      <DialogFooter className="pt-2">
        <Button variant="secondary" onClick={onCancel}>
          {t("order.baCancel")}
        </Button>
        <Button disabled={!agreed} onClick={onAgree}>
          {t("order.baAgree")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
