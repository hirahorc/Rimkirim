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
 * Clearance route picker: two route cards side by side, each a radio. Their
 * spec rows share a subgrid so facts line up across the pair. On small
 * screens a segmented control picks which card is in view.
 */

const KINDS: ClearanceKind[] = ["personal", "passenger"];

/** `mono` marks a monetary lead (Numbers-Are-Mono); `list` splits the value on "|". */
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
  // the column shown on small screens (independent of the choice, so a locked
  // route can still be read)
  const [viewed, setViewed] = React.useState<ClearanceKind>(
    soleAvailable ?? "personal",
  );

  // the route you can actually take reads first; a locked route never leads
  const ordered: ClearanceKind[] = allowed.personal
    ? KINDS
    : [...KINDS].reverse();

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
  // jump straight to the first question that failed, not the top of the form
  const changeAnswersHref =
    answers.livedLongEnough !== true ? "/pesan#q3" : "/pesan#q4";

  // arrow keys move between the enabled cards (radiogroup convention)
  const cardRefs = React.useRef<
    Partial<Record<ClearanceKind, HTMLDivElement | null>>
  >({});
  const moveFocus = (from: ClearanceKind, dir: 1 | -1) => {
    const enabledKinds = ordered.filter((k) => allowed[k]);
    if (enabledKinds.length < 2) return;
    const i = enabledKinds.indexOf(from);
    const next =
      enabledKinds[(i + dir + enabledKinds.length) % enabledKinds.length];
    pick(next);
    // on small screens the target card is display:none until `viewed` re-renders,
    // so focus it on the next frame rather than synchronously
    requestAnimationFrame(() => cardRefs.current[next]?.focus());
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div>
        <header className="mb-8 text-center">
          {/* the questionnaire's positive outcome, said out loud — the negative
            outcomes get a full card, so passing deserves at least a sentence */}
          {/* success is carried by the lime-filled check (Marker Rule), the words stay in
            ink: #16a34a text on white is only 3.3:1 */}
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <span
              aria-hidden
              className="grid size-5 place-items-center rounded-full bg-brand text-brand-ink"
            >
              <Check className="size-3" strokeWidth={3.5} />
            </span>
            {soleAvailable
              ? t("order.clEligibleFor").replace(
                  "{route}",
                  t(`${PREFIX[soleAvailable]}Title`),
                )
              : t("order.clEligibleNote")}
          </p>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-2">
            {t("order.clEyebrow")}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {soleAvailable ? t("order.clTitleSole") : t("order.clTitle")}
          </h1>
          {/* the reassurance belongs where the anxiety starts, not under the button */}
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
            {t("order.clFooter")}
          </p>
        </header>

        {/* mobile: segmented control picks the card in view */}
        <div className="mb-3 grid grid-cols-2 gap-1 rounded-full border border-border bg-surface-2 p-1 sm:hidden">
          {ordered.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={viewed === k}
              // one model on mobile: the pill both shows and (when allowed) chooses the route
              onClick={() => pick(k)}
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

        {/* two route cards; on sm+ they share one row grid (subgrid) so every
          spec lines up across the pair without a table */}
        <div
          role="radiogroup"
          aria-label={t("order.clTitle")}
          className="grid gap-4 sm:grid-cols-2 sm:grid-rows-[auto_repeat(5,auto)]"
        >
          {ordered.map((k) => {
            const enabled = allowed[k];
            const isSelected = enabled && selected === k;
            return (
              <div
                key={k}
                ref={(el) => {
                  cardRefs.current[k] = el;
                }}
                role="radio"
                aria-checked={isSelected}
                aria-disabled={!enabled}
                aria-labelledby={`cl-${k}-title`}
                aria-describedby={enabled ? undefined : `cl-${k}-locked`}
                // a locked route stays reachable by Tab so its reason (and the
                // way to change it) is announced, it just can't be checked
                tabIndex={0}
                onClick={() => pick(k)}
                onKeyDown={(ev) => {
                  if (ev.key === "ArrowRight" || ev.key === "ArrowDown") {
                    ev.preventDefault();
                    moveFocus(k, 1);
                  } else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") {
                    ev.preventDefault();
                    moveFocus(k, -1);
                  } else if (
                    enabled &&
                    (ev.key === "Enter" || ev.key === " ")
                  ) {
                    ev.preventDefault();
                    pick(k);
                  }
                }}
                className={cn(
                  "grid overflow-hidden rounded-lg border bg-background outline-none transition-[border-color,box-shadow,background-color] sm:row-span-full sm:grid-rows-subgrid",
                  viewed !== k && "hidden sm:grid",
                  enabled && "cursor-pointer",
                  enabled &&
                    !isSelected &&
                    "border-border hover:border-border-strong",
                  // selection = ink outline + a whisper of lime; the lime check does the talking
                  isSelected &&
                    "border-foreground bg-brand-soft/15 ring-2 ring-foreground/10",
                  !enabled && "border-border bg-surface-2/60",
                  "focus-visible:ring-2 focus-visible:ring-foreground/50",
                )}
              >
                {/* card header = the radio */}
                <div className="border-b border-border p-5 sm:p-6">
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
                        <Check
                          className="radio-check-in size-3"
                          strokeWidth={3.5}
                        />
                      ) : !enabled ? (
                        <Lock className="size-2.5 text-muted-2" />
                      ) : null}
                    </span>
                    <div className="min-w-0">
                      <h2
                        id={`cl-${k}-title`}
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
                    <p
                      id={`cl-${k}-locked`}
                      className="mt-3 text-xs leading-relaxed text-muted"
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
                  )}
                </div>

                {/* specs: label over value, one per subgrid row */}
                {ROWS.map((row, ri) => (
                  <div
                    key={row.key}
                    className={cn(
                      "px-5 py-4 sm:px-6",
                      ri < ROWS.length - 1 && "border-b border-border/70",
                    )}
                  >
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.04em] text-muted-2">
                      {t(row.labelKey)}
                      {"tipKey" in row && (
                        // the tip's tap must not double as "pick this card"
                        <span
                          onClick={(ev) => ev.stopPropagation()}
                          className="inline-flex normal-case tracking-normal"
                        >
                          <InfoTip
                            content={t(row.tipKey)}
                            label={t(row.labelKey)}
                          />
                        </span>
                      )}
                    </p>
                    <CellValue
                      lead={t(`${PREFIX[k]}${row.key}`)}
                      note={
                        "list" in row ? "" : t(`${PREFIX[k]}${row.key}Note`)
                      }
                      mono={"mono" in row}
                      list={"list" in row}
                      muted={!enabled}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-stretch gap-2 sm:items-end">
          {/* say why the button is grey; the button itself is disabled, so the
              hint is the only thing a mouse user gets */}
          {!selected && (
            <p id="cl-pick-hint" role="status" className="text-xs text-muted-2 sm:text-right">
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
