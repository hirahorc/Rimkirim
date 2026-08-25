"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Check, ArrowRight } from "lucide-react";
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
 * ONE tree for every size: each card carries its own spec rows. sm+ puts the
 * two cards side by side on a shared subgrid so every spec lines up; below sm
 * the same cards simply stack full-width, denser but structurally identical.
 */

const KINDS: ClearanceKind[] = ["personal", "passenger"];

/**
 * Spec rows in two groups: the ones that DECIDE the choice (tax, cap, window)
 * and the ones you then prepare (SKP, documents). Neutral, but weighted.
 * `mono` marks a monetary row (Numbers-Are-Mono); `list` splits the value on "|".
 */
const ROWS = [
  { key: "Tax", labelKey: "order.clRowTax", group: "decide" },
  {
    key: "ValueCap",
    labelKey: "order.clRowValueCap",
    group: "decide",
    mono: true,
    tipKey: "order.clTipValueCap",
  },
  {
    key: "Window",
    labelKey: "order.clRowWindow",
    group: "decide",
    tipKey: "order.clTipWindow",
  },
  { key: "Skp", labelKey: "order.clRowSkp", group: "prepare", tipKey: "order.clTipSkp" },
  { key: "Docs", labelKey: "order.clRowDocs", group: "prepare", list: true },
] as const;
type Row = (typeof ROWS)[number];
const GROUP_LABEL = { decide: "order.clGroupDecide", prepare: "order.clGroupPrepare" } as const;
/** index of the first row of each group, where the group eyebrow sits */
const GROUP_STARTS = ROWS.reduce<Record<string, number>>((acc, r, i) => {
  if (!(r.group in acc)) acc[r.group] = i;
  return acc;
}, {});

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
  // Enter/Space on a locked radio: say why instead of staying silent
  const [lockedNudge, setLockedNudge] = React.useState("");
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

  // arrow keys move between the enabled radios (radiogroup convention)
  const radioRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const moveFocus = (from: ClearanceKind, dir: 1 | -1) => {
    const enabledKinds = ordered.filter((k) => allowed[k]);
    if (enabledKinds.length < 2) return;
    const i = enabledKinds.indexOf(from);
    const next =
      enabledKinds[(i + dir + enabledKinds.length) % enabledKinds.length];
    pick(next);
    radioRefs.current[next]?.focus();
  };

  const onRadioKeyDown =
    (k: ClearanceKind) => (ev: React.KeyboardEvent) => {
      if (ev.key === "ArrowRight" || ev.key === "ArrowDown") {
        ev.preventDefault();
        moveFocus(k, 1);
      } else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") {
        ev.preventDefault();
        moveFocus(k, -1);
      } else if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        if (allowed[k]) pick(k);
        else setLockedNudge(`${t("order.clLockedTitle")}: ${lockedReasons.join(t("order.clLockedJoin"))}`);
      }
    };

  // plain render helpers (not components) so the buttons keep their identity,
  // and their focus, across re-renders
  const radioHead = (k: ClearanceKind) => {
    const enabled = allowed[k];
    const isSelected = enabled && selected === k;
    const id = `cl-${k}`;
    return (
      <button
        type="button"
        ref={(el) => {
          radioRefs.current[k] = el;
        }}
        role="radio"
        aria-checked={isSelected}
        aria-disabled={!enabled}
        aria-labelledby={`${id}-title`}
        aria-describedby={
          enabled ? `${id}-specs` : `${id}-locked ${id}-specs`
        }
        // a locked route stays reachable by Tab so its reason (and the way to
        // change it) is announced, it just can't be checked
        tabIndex={0}
        onKeyDown={onRadioKeyDown(k)}
        // the focus ring is drawn by the card (has-[[role=radio]:focus-visible]).
        // radio sits RIGHT of the title so the title shares one left rail with
        // every spec row below — a leading radio gave the card two left edges
        className={cn(
          "flex w-full items-start gap-3 p-4 text-left outline-hidden sm:p-5",
          !enabled && "cursor-default",
        )}
      >
        <span className="min-w-0 flex-1">
          <span
            id={`${id}-title`}
            className={cn(
              "block font-display text-lg font-semibold leading-tight tracking-tight sm:text-xl",
              !enabled && "text-muted",
            )}
          >
            {t(`${PREFIX[k]}Title`)}
          </span>
          <span className="mt-1 block font-display text-xs font-medium uppercase tracking-[0.04em] text-muted-2">
            {t(`${PREFIX[k]}Subtitle`)}
          </span>
        </span>
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
            <Lock className="size-3 text-muted" strokeWidth={2.5} />
          ) : null}
        </span>
      </button>
    );
  };

  /** Why the route is locked, as real (reachable) content outside the radio. */
  const lockedReason = (k: ClearanceKind) => (
    <p
      id={`cl-${k}-locked`}
      className="-mt-1 px-4 pb-4 text-xs leading-relaxed text-muted sm:-mt-2 sm:px-5 sm:pb-5"
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

  const groupEyebrow = (ri: number) => {
    const g = ROWS[ri].group;
    if (GROUP_STARTS[g] !== ri) return null;
    return (
      <p className="mb-2 font-display text-sm font-semibold tracking-tight text-foreground">
        {t(GROUP_LABEL[g])}
      </p>
    );
  };

  const rowLabel = (row: Row) => (
    <p className="mb-1 flex items-center gap-1.5 font-display text-xs font-medium uppercase tracking-[0.04em] text-muted-2">
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

  // card chrome
  const cardClass = (k: ClearanceKind) => {
    const enabled = allowed[k];
    const isSelected = enabled && selected === k;
    return cn(
      // rounded-md: data-dense comparison card (DESIGN.md, Cards/Containers) —
      // the corner curve stays inside the p-4/p-5 padding (Clearance Rule)
      "overflow-hidden rounded-md border bg-background transition-[border-color,background-color]",
      enabled && "cursor-pointer",
      enabled && !isSelected && "border-border hover:border-border-strong",
      // selection = ink outline + a whisper of lime; the lime check does the talking
      isSelected && "border-foreground bg-brand-soft/15",
      !enabled && "border-border bg-surface-2",
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
        {/* left on phones, centred from sm up — the flow's shared header
            alignment (same on /pesan and /pesan/modul) */}
        <header className="mb-8 text-left sm:text-center">
          {/* the questionnaire's positive outcome IS the eyebrow. Ink check on a
            quiet disc: lime is reserved for the chosen route and the button
            (One-Voice). The outer flex centres the pair, the inner one keeps
            the check on the first line when the text wraps */}
          <p className="flex justify-start sm:justify-center">
            <span className="inline-flex items-start gap-2 text-left text-sm font-medium text-foreground">
              <span
                aria-hidden
                className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-surface-3 text-foreground"
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
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:mx-auto">
            {t("order.clFooter")}
            {/* one way back per state: the locked card carries its own link */}
            {!soleAvailable && (
              <>
                {" "}
                <Link href="/pesan" className="link-mark whitespace-nowrap">
                  {t("order.clReviewAnswers")}
                </Link>
              </>
            )}
          </p>
        </header>

        {/* one tree: stacked full cards below sm, two cards on one shared
          subgrid from sm up so every spec row lines up across the pair */}
        <div
          role="radiogroup"
          aria-label={t("order.clTitle")}
          className={cn(
            // sm:gap-y-0: the subgrid rows inherit the parent's row gap, which
            // floated every hairline 16px off its row — contiguous rows let the
            // row padding alone set the rhythm
            "grid grid-cols-1 gap-4 sm:gap-y-0 sm:grid-rows-[auto_auto_repeat(5,auto)]",
            // sole state: the route you can take gets the wider desk
            soleAvailable ? "sm:grid-cols-[3fr_2fr]" : "sm:grid-cols-2",
          )}
        >
          {ordered.map((k) => {
            const enabled = allowed[k];
            return (
              <div
                key={k}
                onClick={() => pick(k)}
                className={cn(
                  cardClass(k),
                  "sm:row-span-full sm:grid sm:grid-rows-subgrid",
                )}
              >
                {radioHead(k)}
                {/* the locked reason has its own subgrid row, so the live
                  card's header never stretches to match it */}
                <div className="border-b border-border">
                  {!enabled && lockedReason(k)}
                </div>
                {/* specs: label over value, one per subgrid row; the radio
                  points here with aria-describedby */}
                <div id={`cl-${k}-specs`} className="contents">
                  {ROWS.map((row, ri) => (
                    <div
                      key={row.key}
                      className={cn(
                        "px-4 py-3.5 sm:px-5 sm:py-4",
                        ri < ROWS.length - 1 && "border-b border-border/70",
                        // the group break is a full-strength hairline, not a band
                        GROUP_STARTS.prepare === ri && "pt-4 sm:pt-5",
                        GROUP_STARTS.prepare === ri + 1 && "border-border",
                      )}
                    >
                      {groupEyebrow(ri)}
                      {rowLabel(row)}
                      {cell(k, row)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* on phones the button sticks to the bottom once a route is chosen, so
          the commit is always a thumb away; desktop keeps it in flow */}
        <div
          className={cn(
            // desktop: note + button on the page's centre axis, same as the
            // header — a right-hung button was the page's third alignment
            "mt-8 flex flex-col items-stretch gap-2 sm:items-center",
            selected &&
              "sticky bottom-0 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none",
          )}
        >
          {/* the honest part of the commit, read BEFORE the thumb lands: this
              gate is one-way, said at body size in ink, not whispered */}
          <p id="cl-oneway" className="text-sm leading-snug text-foreground sm:text-center">
            <span className="font-semibold">{t("order.clOneWayLead")}</span>{" "}
            <span className="text-muted">{t("order.clOneWay")}</span>
          </p>
          {/* same button idiom as the eligibility page: full-width, constant
              "Lanjut →" label, lime only when it can actually be pressed; the
              "pick one first" hint is the quiet line below */}
          <Button
            aria-describedby={selected ? "cl-oneway" : "cl-oneway cl-pick-hint"}
            size="lg"
            variant={selected ? "brand" : "secondary"}
            className="w-full"
            disabled={!selected}
            onClick={onContinue}
          >
            {t("order.seeResult")}
            <ArrowRight className="size-4" />
          </Button>
          {!selected && (
            <p
              id="cl-pick-hint"
              role="status"
              className="text-center text-xs text-muted-2"
            >
              {t("order.clPickHint")}
            </p>
          )}
          <p role="status" aria-live="polite" className="sr-only">
            {lockedNudge}
          </p>
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
