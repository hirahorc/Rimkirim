"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Check } from "lucide-react";
import {
  useOrderStore,
  allowedClearance,
  type ClearanceKind,
} from "@/lib/store/useOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/**
 * Clearance route picker: a two-column comparison table. Column headers are
 * the radios; clicking anywhere in a column selects it. On small screens the
 * headers become a segmented control and the table shows one column at a time.
 */

const KINDS: ClearanceKind[] = ["personal", "passenger"];

/** `mono` marks a monetary lead (Numbers-Are-Mono); `list` splits the value on "|". */
const ROWS = [
  { key: "Tax", labelKey: "order.clRowTax" },
  { key: "ValueCap", labelKey: "order.clRowValueCap", mono: true },
  { key: "Skp", labelKey: "order.clRowSkp" },
  { key: "Window", labelKey: "order.clRowWindow" },
  { key: "Docs", labelKey: "order.clRowDocs", list: true },
] as const;

const PREFIX: Record<ClearanceKind, string> = {
  personal: "order.clPersonal",
  passenger: "order.clPassenger",
};

export function ClearanceOptions() {
  const t = useT();
  const router = useRouter();
  const context = useOrderStore((s) => s.context);
  const answers = useOrderStore((s) => s.answers);
  const setClearance = useOrderStore((s) => s.setClearance);
  const allowed = allowedClearance(answers);

  // Moving Abroad has no clearance step — skip straight to the module hub.
  React.useEffect(() => {
    if (context?.service === "moving-abroad") router.replace("/pesan/modul");
  }, [context, router]);

  // pre-select the sole available option; otherwise start with none
  const soleAvailable: ClearanceKind | null =
    allowed.personal && allowed.passenger
      ? null
      : allowed.personal
        ? "personal"
        : "passenger";
  const [selected, setSelected] = React.useState<ClearanceKind | null>(soleAvailable);
  // the column shown on small screens (independent of the choice, so a locked
  // route can still be read)
  const [viewed, setViewed] = React.useState<ClearanceKind>(soleAvailable ?? "personal");

  const pick = (k: ClearanceKind) => {
    setViewed(k);
    if (allowed[k]) setSelected(k);
  };

  const onContinue = () => {
    if (!selected) return;
    setClearance(selected);
    router.push("/pesan/modul");
  };

  // why Personal Belongings is locked, phrased from the actual answers
  const lockedReasons = [
    answers.livedLongEnough !== true && t("order.clLockedLived"),
    answers.canApplySKP !== true && t("order.clLockedSkp"),
  ].filter((r): r is string => Boolean(r));

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("order.clTitle")}
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted">{t("order.clSubtitle")}</p>
      </header>

      {/* mobile: segmented control picks the column in view */}
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-full border border-border bg-surface-2 p-1 sm:hidden">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setViewed(k)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
              viewed === k ? "bg-foreground text-background" : "text-muted",
            )}
          >
            {!allowed[k] && <Lock className="size-3.5" />}
            {t(`${PREFIX[k]}Title`)}
          </button>
        ))}
      </div>

      <div
        role="radiogroup"
        aria-label={t("order.clTitle")}
        className="overflow-hidden rounded-lg border border-border bg-background"
      >
        {/* header row */}
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,10rem)_1fr_1fr] md:grid-cols-[minmax(0,12rem)_1fr_1fr]">
          <div className="hidden border-b border-border bg-surface-2 sm:block" />
          {KINDS.map((k, i) => {
            const enabled = allowed[k];
            const isSelected = enabled && selected === k;
            return (
              <div
                key={k}
                role="radio"
                aria-checked={isSelected}
                aria-disabled={!enabled}
                tabIndex={enabled ? 0 : -1}
                onClick={() => pick(k)}
                onKeyDown={(ev) => {
                  if (enabled && (ev.key === "Enter" || ev.key === " ")) {
                    ev.preventDefault();
                    pick(k);
                  }
                }}
                className={cn(
                  "relative border-b border-border p-4 outline-none transition-colors sm:px-5 sm:py-6",
                  i === 0 && "sm:border-l sm:border-l-border",
                  i === 1 && "sm:border-l sm:border-l-border",
                  viewed !== k && "hidden sm:block",
                  enabled && "cursor-pointer hover:bg-surface-2/60",
                  isSelected && "bg-brand/10 hover:bg-brand/10",
                  !enabled && "bg-surface-2/40",
                  "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/50",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                      isSelected
                        ? "border-foreground bg-foreground text-brand"
                        : "border-border-strong bg-surface",
                      !enabled && "border-border",
                    )}
                  >
                    {isSelected ? (
                      <Check className="size-3" strokeWidth={3.5} />
                    ) : !enabled ? (
                      <Lock className="size-2.5 text-muted-2" />
                    ) : null}
                  </span>
                  <div className="min-w-0">
                    <h2
                      className={cn(
                        "font-display text-xl font-semibold leading-tight tracking-tight",
                        !enabled && "text-muted",
                      )}
                    >
                      {t(`${PREFIX[k]}Title`)}
                    </h2>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.04em] text-muted-2">
                      {t(`${PREFIX[k]}Subtitle`)}
                    </p>
                  </div>
                </div>
                {!enabled && (
                  <p className="mt-3 text-xs leading-relaxed text-muted">
                    <span className="font-medium text-foreground">{t("order.clLockedTitle")}</span>
                    {lockedReasons.length > 0 && (
                      <>
                        {": "}
                        {lockedReasons.join(t("order.clLockedJoin"))}
                      </>
                    )}
                    {". "}
                    <Link href="/pesan" className="link-mark whitespace-nowrap">
                      {t("order.clChangeAnswers")}
                    </Link>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* comparison rows */}
        {ROWS.map((row, ri) => (
          <div
            key={row.key}
            className={cn(
              "grid grid-cols-1 sm:grid-cols-[minmax(0,10rem)_1fr_1fr] md:grid-cols-[minmax(0,12rem)_1fr_1fr]",
              ri < ROWS.length - 1 && "border-b border-border",
            )}
          >
            <div className="px-4 pt-3 text-xs font-medium uppercase tracking-[0.04em] text-muted-2 sm:bg-surface-2 sm:px-5 sm:py-4">
              {t(row.labelKey)}
            </div>
            {KINDS.map((k) => {
              const enabled = allowed[k];
              const isSelected = enabled && selected === k;
              return (
                <div
                  key={k}
                  onClick={() => pick(k)}
                  className={cn(
                    "px-4 pb-3 pt-1 sm:border-l sm:border-l-border sm:px-5 sm:py-4",
                    viewed !== k && "hidden sm:block",
                    enabled ? "cursor-pointer text-foreground" : "text-muted",
                    isSelected && "sm:bg-brand/10",
                  )}
                >
                  <CellValue
                    lead={t(`${PREFIX[k]}${row.key}`)}
                    note={"list" in row ? "" : t(`${PREFIX[k]}${row.key}Note`)}
                    mono={"mono" in row}
                    list={"list" in row}
                    muted={!enabled}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="order-2 max-w-md text-xs leading-relaxed text-muted-2 sm:order-1">
          {t("order.clFooter")}
        </p>
        <Button
          size="lg"
          className="order-1 w-full sm:order-2 sm:w-auto sm:min-w-56"
          disabled={!selected}
          onClick={onContinue}
        >
          {t("order.continue")} <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

/** A comparison cell: a scannable lead, an optional quieter note, or a stacked list. */
function CellValue({
  lead,
  note,
  mono,
  list,
  muted,
}: {
  lead: string;
  note: string;
  mono: boolean;
  list: boolean;
  muted: boolean;
}) {
  if (list) {
    return (
      <ul className={cn("space-y-1 text-sm leading-snug", muted ? "text-muted" : "text-foreground")}>
        {lead.split("|").map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-[0.55em] size-1 shrink-0 rounded-full bg-current opacity-60" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <>
      <p
        className={cn(
          "text-sm font-semibold leading-snug",
          mono && /^(USD|IDR|Rp)\b/.test(lead) && "font-mono tabular-nums",
          muted ? "text-muted" : "text-foreground",
        )}
      >
        {lead}
      </p>
      {note && (
        <p className={cn("mt-0.5 text-sm leading-snug", muted ? "text-muted-2" : "text-muted")}>
          {note}
        </p>
      )}
    </>
  );
}
