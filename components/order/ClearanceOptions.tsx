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
import { InfoTip, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";

/**
 * Clearance route picker. The radio is the card HEADER only (check + title);
 * the spec rows are ordinary content beside it, so assistive tech can read the
 * comparison instead of a bare "radio, not checked" (children of a radio are
 * presentational). Tapping anywhere on the card still picks it.
 *
 * sm+: two cards side by side sharing one subgrid so every spec lines up.
 * <sm: two compact radio cards, then ONE comparison list (label, A | B) so the
 * phone never has to scroll-remember a value from the other card.
 */

const KINDS: ClearanceKind[] = ["personal", "passenger"];
type Scope = "m" | "d";

/** `mono` marks a monetary row (Numbers-Are-Mono); `list` splits the value on "|". */
const ROWS = [
  { key: "Tax", labelKey: "order.clRowTax" },
  {
    key: "ValueCap",
    labelKey: "order.clRowValueCap",
    mono: true,
    tipKey: "order.clTipValueCap",
  },
  { key: "Skp", labelKey: "order.clRowSkp", tipKey: "order.clTipSkp" },
  { key: "Window", labelKey: "order.clRowWindow", tipKey: "order.clTipWindow" },
  { key: "Docs", labelKey: "order.clRowDocs", list: true },
] as const;
type Row = (typeof ROWS)[number];

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
  const [selected, setSelected] = React.useState<ClearanceKind | null>(
    soleAvailable,
  );
  // the route you can actually take reads first; a locked route never leads
  const ordered: ClearanceKind[] = allowed.personal
    ? KINDS
    : [...KINDS].reverse();

  const pick = (k: ClearanceKind) => {
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
  // jump straight to the first question that failed, not the top of the form
  const changeAnswersHref =
    answers.livedLongEnough !== true ? "/pesan#q3" : "/pesan#q4";

  // arrow keys move between the enabled radios (radiogroup convention); the
  // phone and desktop layouts each own a set, only the visible one is reachable
  const radioRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const moveFocus = (from: ClearanceKind, dir: 1 | -1, scope: Scope) => {
    const enabledKinds = ordered.filter((k) => allowed[k]);
    if (enabledKinds.length < 2) return;
    const i = enabledKinds.indexOf(from);
    const next =
      enabledKinds[(i + dir + enabledKinds.length) % enabledKinds.length];
    pick(next);
    radioRefs.current[`${scope}-${next}`]?.focus();
  };

  const onRadioKeyDown =
    (k: ClearanceKind, scope: Scope) => (ev: React.KeyboardEvent) => {
      if (ev.key === "ArrowRight" || ev.key === "ArrowDown") {
        ev.preventDefault();
        moveFocus(k, 1, scope);
      } else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") {
        ev.preventDefault();
        moveFocus(k, -1, scope);
      } else if (allowed[k] && (ev.key === "Enter" || ev.key === " ")) {
        ev.preventDefault();
        pick(k);
      }
    };

  // plain render helpers (not components) so the buttons keep their identity,
  // and their focus, across re-renders
  const radioHead = (k: ClearanceKind, scope: Scope, compact = false) => {
    const enabled = allowed[k];
    const isSelected = enabled && selected === k;
    const id = `cl-${scope}-${k}`;
    return (
      <button
        type="button"
        ref={(el) => {
          radioRefs.current[`${scope}-${k}`] = el;
        }}
        role="radio"
        aria-checked={isSelected}
        aria-disabled={!enabled}
        aria-labelledby={`${id}-title`}
        aria-describedby={enabled ? `${id}-specs` : `${id}-locked ${id}-specs`}
        // a locked route stays reachable by Tab so its reason (and the way to
        // change it) is announced, it just can't be checked
        tabIndex={0}
        onKeyDown={onRadioKeyDown(k, scope)}
        // the focus ring is drawn by the card (has-[[role=radio]:focus-visible])
        className={cn(
          "flex w-full items-start gap-3 text-left outline-hidden",
          compact ? "p-4" : "p-5 sm:p-6",
          !enabled && "cursor-default",
        )}
      >
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
            <Check className="radio-check-in size-3" strokeWidth={3.5} />
          ) : !enabled ? (
            <Lock className="size-2.5 text-muted-2" />
          ) : null}
        </span>
        <span className="min-w-0">
          <span
            id={`${id}-title`}
            className={cn(
              "block font-display font-semibold leading-tight tracking-tight",
              compact ? "text-lg" : "text-xl",
              !enabled && "text-muted",
            )}
          >
            {t(`${PREFIX[k]}Title`)}
          </span>
          <span className="mt-1 block text-xs font-medium uppercase tracking-[0.04em] text-muted-2">
            {t(`${PREFIX[k]}Subtitle`)}
          </span>
        </span>
      </button>
    );
  };

  /** Why the route is locked, as real (reachable) content outside the radio. */
  const lockedReason = (k: ClearanceKind, scope: Scope, className: string) => (
    <p
      id={`cl-${scope}-${k}-locked`}
      className={cn("text-xs leading-relaxed text-muted", className)}
    >
      <span className="font-medium text-foreground">
        {t("order.clLockedTitle")}
      </span>
      {lockedReasons.length > 0 && (
        <>
          {": "}
          {lockedReasons.join(t("order.clLockedJoin"))}
        </>
      )}
      {". "}
      <Link
        href={changeAnswersHref}
        onClick={(ev) => ev.stopPropagation()}
        // 24px minimum target without disturbing the line box
        className="link-mark -my-1.5 inline-flex min-h-6 items-center whitespace-nowrap py-1.5"
      >
        {t("order.clChangeAnswers")}
      </Link>
    </p>
  );

  const rowLabel = (row: Row) => (
    <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.04em] text-muted-2">
      {t(row.labelKey)}
      {"tipKey" in row && (
        // the tip's tap must not double as "pick this card"
        <span
          onClick={(ev) => ev.stopPropagation()}
          className="inline-flex normal-case tracking-normal"
        >
          <InfoTip content={t(row.tipKey)} label={t(row.labelKey)} />
        </span>
      )}
    </p>
  );

  const cell = (k: ClearanceKind, row: Row) => (
    <CellValue
      lead={t(`${PREFIX[k]}${row.key}`)}
      note={"list" in row ? "" : t(`${PREFIX[k]}${row.key}Note`)}
      mono={"mono" in row}
      list={"list" in row}
      muted={!allowed[k]}
    />
  );

  // card chrome shared by both layouts
  const cardClass = (k: ClearanceKind) => {
    const enabled = allowed[k];
    const isSelected = enabled && selected === k;
    return cn(
      "overflow-hidden rounded-lg border bg-background transition-[border-color,background-color]",
      enabled && "cursor-pointer",
      enabled && !isSelected && "border-border hover:border-border-strong",
      // selection = ink outline + a whisper of lime; the lime check does the talking
      isSelected && "border-foreground bg-brand-soft/15",
      !enabled && "border-border bg-surface-2/60",
      // keyboard focus on the radio draws a ring OUTSIDE the whole card, so it
      // can never be mistaken for the selected card's ink border
      "has-[[role=radio]:focus-visible]:outline-2 has-[[role=radio]:focus-visible]:outline-offset-4 has-[[role=radio]:focus-visible]:outline-solid has-[[role=radio]:focus-visible]:outline-foreground/60",
    );
  };

  const eligibleLine = soleAvailable
    ? t("order.clEligibleFor").replace(
        "{route}",
        t(`${PREFIX[soleAvailable]}Title`),
      )
    : t("order.clEligibleNote");

  return (
    <TooltipProvider delayDuration={150}>
      <div>
        <header className="mb-8 text-center">
          {/* the questionnaire's positive outcome IS the eyebrow: lime-filled
            check (Marker Rule), words in ink. The outer flex centres the pair,
            the inner one keeps the check on the first line when the text wraps */}
          <p className="flex justify-center">
            <span className="inline-flex items-start gap-2 text-left text-sm font-medium text-foreground">
              <span
                aria-hidden
                className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-brand text-brand-ink"
              >
                <Check className="size-3" strokeWidth={3.5} />
              </span>
              {eligibleLine}
            </span>
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {soleAvailable ? t("order.clTitleSole") : t("order.clTitle")}
          </h1>
          {/* who does what, and a way back, in one line */}
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
            {t("order.clFooter")}{" "}
            <Link href="/pesan" className="link-mark whitespace-nowrap">
              {t("order.clReviewAnswers")}
            </Link>
          </p>
        </header>

        {/* ---------- sm+: two cards on one subgrid ---------- */}
        <div
          role="radiogroup"
          aria-label={t("order.clTitle")}
          className="hidden gap-4 sm:grid sm:grid-cols-2 sm:grid-rows-[auto_repeat(5,auto)]"
        >
          {ordered.map((k) => {
            const enabled = allowed[k];
            return (
              <div
                key={k}
                onClick={() => pick(k)}
                className={cn(
                  cardClass(k),
                  "grid sm:row-span-full sm:grid-rows-subgrid",
                )}
              >
                <div className="border-b border-border">
                  {radioHead(k, "d")}
                  {!enabled &&
                    lockedReason(k, "d", "-mt-2 px-5 pb-5 sm:px-6 sm:pb-6")}
                </div>
                {/* specs: label over value, one per subgrid row; the radio
                  points here with aria-describedby */}
                <div id={`cl-d-${k}-specs`} className="contents">
                  {ROWS.map((row, ri) => (
                    <div
                      key={row.key}
                      className={cn(
                        "px-5 py-4 sm:px-6",
                        ri < ROWS.length - 1 && "border-b border-border/70",
                      )}
                    >
                      {rowLabel(row)}
                      {cell(k, row)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ---------- <sm: compact radios, then one comparison list ---------- */}
        <div className="sm:hidden">
          <div
            role="radiogroup"
            aria-label={t("order.clTitle")}
            className="grid gap-3"
          >
            {ordered.map((k) => {
              const enabled = allowed[k];
              return (
                <div key={k} onClick={() => pick(k)} className={cardClass(k)}>
                  {radioHead(k, "m", true)}
                  {!enabled && lockedReason(k, "m", "-mt-1 px-4 pb-4")}
                </div>
              );
            })}
          </div>

          {/* the comparison: one list, both routes per row, columns in the same
            order as the radios above so they read like the cards */}
          <div
            id={`cl-m-${ordered[0]}-specs`}
            className="mt-6 rounded-lg border border-border"
          >
            {/* the second radio is described by the same list */}
            <span id={`cl-m-${ordered[1]}-specs`} className="sr-only">
              {t("order.clCompareLabel")}
            </span>
            <div className="grid grid-cols-2 gap-x-4 border-b border-border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.04em] text-muted-2">
              {ordered.map((k) => (
                <span
                  key={k}
                  className={cn(!allowed[k] && "text-muted-2/70")}
                >
                  {t(`${PREFIX[k]}Title`)}
                </span>
              ))}
            </div>
            {ROWS.map((row, ri) => (
              <div
                key={row.key}
                className={cn(
                  "px-4 py-3",
                  ri < ROWS.length - 1 && "border-b border-border/70",
                )}
              >
                {rowLabel(row)}
                <div className="grid grid-cols-2 gap-x-4">
                  {ordered.map((k) => (
                    <div key={k}>{cell(k, row)}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* on phones the button sticks to the bottom once a route is chosen, so
          the commit is always a thumb away; desktop keeps it in flow */}
        <div
          className={cn(
            "mt-8 flex flex-col items-stretch gap-2 sm:items-end",
            selected &&
              "sticky bottom-0 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none",
          )}
        >
          {/* say why the button is grey; the button itself is disabled, so the
              hint is the only thing a mouse user gets */}
          {!selected && (
            <p
              id="cl-pick-hint"
              role="status"
              className="text-xs text-muted-2 sm:text-right"
            >
              {t("order.clPickHint")}
            </p>
          )}
          <Button
            aria-describedby={selected ? undefined : "cl-pick-hint"}
            size="lg"
            className="w-full sm:w-auto sm:min-w-56"
            disabled={!selected}
            onClick={onContinue}
          >
            {t("order.continue")} <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </TooltipProvider>
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
      <ul
        className={cn(
          "space-y-1 text-sm leading-snug",
          muted ? "text-muted" : "text-foreground",
        )}
      >
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
        <p
          className={cn(
            "mt-0.5 text-sm leading-snug",
            muted ? "text-muted-2" : "text-muted",
          )}
        >
          {note}
        </p>
      )}
    </>
  );
}
