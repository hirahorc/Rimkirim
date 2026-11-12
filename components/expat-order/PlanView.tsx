"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CollapseHeight } from "@/components/ui/disclosure";
import { ReviewNote } from "@/components/expat/ReviewNote";
import { dialCodeFor } from "@/lib/data/dial-codes";
import { ORDER_REVIEW_NOTES } from "@/lib/data/expat-order-notes";
import { chargedWeight, type ExpatRate } from "@/lib/pricing/expat-rates";
import {
  checkedRate,
  detailsProgress,
  eligibilityProgress,
  packedPricing,
  packingProgress,
  packingTotals,
  type DetailsInput,
  type EligibilityAnswers,
  type PackingInput,
} from "@/lib/order/expat-order";
import { useExpatOrderHydrated, useExpatOrderStore } from "@/lib/store/useExpatOrderStore";
import { formatIDR, formatNumber } from "@/lib/utils/currency";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { shortDate } from "./booking-facts";
import { CustomsPaths } from "./CustomsPaths";
import { DetailsStep } from "./DetailsStep";
import { EligibilityStep } from "./EligibilityStep";
import { FlowLoading } from "./FlowLoading";
import { PACE, paced } from "./pace";
import { PackingStep } from "./PackingStep";
import { SelectedService } from "./SelectedService";
import { ServicePicker } from "./ServicePicker";
import { markJustBooked, useDraftWelcome } from "./visit";

/** the plan's three parts, in the order they're asked */
const PARTS = ["eligibility", "details", "packing"] as const;
type Part = (typeof PARTS)[number];

/** what a part marks as still to give once the action was pressed: a field
 *  in error, or an answer group left open */
const MISSING = '[aria-invalid="true"], [data-missing]';
const FOCUSABLE = "input, button, select, textarea, [tabindex]";

/** why the action waits, for the part in hand */
const HINT: Record<Part, string> = {
  eligibility: "incomplete",
  details: "detailsIncomplete",
  packing: "packingIncomplete",
};

/**
 * Each part said back in a line, for when it's folded: what's shipping and
 * why, who and when, how many packages. Empty until the part has something
 * to say.
 */
function saidBack(
  t: (path: string) => string,
  a: EligibilityAnswers,
  d: DetailsInput,
  packing: PackingInput,
): Record<Part, string> {
  const e = (k: string) => t(`expatOrder.eligibility.${k}`);
  const bk = (k: string) => t(`expatOrder.booking.${k}`);
  const items = a.items.map((c) => (c === "others" && a.itemsOther.trim() ? a.itemsOther.trim() : e(`items.${c}`)));
  const totals = packingTotals(packing);
  const line = (parts: string[]) => parts.filter(Boolean).join(" · ");
  return {
    eligibility: line([
      items.join(", "),
      a.location ? e(a.location) : "",
      a.reason ? (a.reason === "others" && a.reasonOther.trim() ? a.reasonOther.trim() : e(`reasons.${a.reason}`)) : "",
    ]),
    details: line([
      d.fullName.trim(),
      d.phone.trim() ? `${dialCodeFor(d.dialIso) ?? ""} ${d.phone.trim()}`.trim() : "",
      d.pickupDate ? `${bk("pickup")} ${shortDate(d.pickupDate)}` : "",
    ]),
    packing:
      totals.kg > 0
        ? line([
            totals.packages === 1 ? bk("packagesOne") : bk("packagesMany").replace("{n}", String(totals.packages)),
            bk("chargeable").replace("{kg}", formatNumber(totals.kg, 1, "en")),
          ])
        : "",
  };
}

/** a part's dot, in the status stepper's encoding (DESIGN.md, Status
 *  stepper): done is lime with an Ink check, the one in hand is Ink-framed
 *  with a lime core, one still ahead is Hairline on Panel 2 with its number */
function PartDot({ state, n, className }: { state: "done" | "here" | "ahead"; n: number; className?: string }) {
  // earned motion: the check draws itself for a part just finished, never
  // for one a draft brought finished. The latest change of state decides
  const [was, setWas] = React.useState(state);
  const [earned, setEarned] = React.useState(false);
  if (was !== state) {
    setWas(state);
    setEarned(state === "done");
  }
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-full font-display text-xs font-semibold tabular-nums",
        state === "done" && "bg-brand text-brand-ink",
        state === "here" && "border-2 border-foreground bg-background",
        state === "ahead" && "border border-border-strong bg-surface-2 text-muted",
        className,
      )}
    >
      {state === "done" &&
        (earned ? (
          <svg
            viewBox="0 0 24 24"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path className="check-draw" d="M4 12.5l5 5L20 6.5" />
          </svg>
        ) : (
          <Check className="size-3.5" strokeWidth={3} />
        ))}
      {state === "here" && <span className="size-2 rounded-full bg-brand" />}
      {state === "ahead" && n}
    </span>
  );
}

/**
 * The plan, on one page (the app's field, white cards on Panel 2): the
 * Eligibility Check, Personal Information, then the Packages, three parts
 * down a single sheet with one open at a time. A finished part folds to a
 * line that says it back, and the next opens under it; nothing is a page
 * away, and any part reopens in place. One action runs the lot, with the
 * estimate, where a thumb is: a bar at the foot of a phone, beside the form
 * with the Selected Service on a wide screen. It reads Continue until the
 * last part is in, then Confirm application, which registers the ticket and
 * opens its Booking Summary. It's never disabled: pressed while its part
 * still waits, it names everything missing where it is, goes to the first of
 * it and counts what's left in a toast. Arriving without a rate goes back to
 * Check Rate, and says why.
 */
export function PlanView() {
  const t = useT();
  const router = useRouter();
  const hydrated = useExpatOrderHydrated();
  const rate = useExpatOrderStore((s) => s.rate);
  useDraftWelcome(hydrated, !!rate, t("expatOrder.plan.restored"));
  // confirming clears the draft, the rate with it: the way on from there is
  // the Booking Summary, not back to Check Rate
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    if (!hydrated || rate || sending) return;
    // said, since the page asked for isn't the one that opens (an id, so an
    // effect run twice still says it once)
    toast.info(t("expatOrder.plan.needRate"), { id: "expat-need-rate" });
    router.replace("/expat-relocation/rates");
  }, [hydrated, rate, sending, router, t]);

  // the plan mounts on the loaded draft, so it opens on the part that draft
  // has reached
  if (!hydrated || !rate) return <FlowLoading />;
  return <Plan rate={rate} sending={sending} onSending={setSending} />;
}

function Plan({
  rate,
  sending,
  onSending,
}: {
  rate: ExpatRate;
  sending: boolean;
  onSending: (sending: boolean) => void;
}) {
  const t = useT();
  const p = (k: string) => t(`expatOrder.plan.${k}`);
  const router = useRouter();
  const { check, eligibility, packing, details, addressChanged, setCheck, selectRate, setEligibility, setPacking, setDetails, submit } =
    useExpatOrderStore();
  const cards = React.useRef<Record<Part, HTMLElement | null>>({ eligibility: null, details: null, packing: null });
  const heads = React.useRef<Record<Part, HTMLElement | null>>({ eligibility: null, details: null, packing: null });
  // how often the action was pressed while a part still waited: from the
  // first, that part shows everything it's missing
  const [tried, setTried] = React.useState<Record<Part, number>>({ eligibility: 0, details: 0, packing: 0 });

  const done: Record<Part, boolean> = {
    eligibility: eligibilityProgress(eligibility).done,
    details: detailsProgress(details).done,
    packing: packingProgress(packing).done,
  };
  const todo = PARTS.find((k) => !done[k]) ?? null;
  // opens on the first part still to do; all done, everything is folded
  const [open, setOpen] = React.useState<Part | null>(todo);

  // the fold runs first (CollapseHeight, 340ms at most), then the part that
  // opened comes to the top and its title takes focus: what was pressed is
  // gone (the action's part folded, a folded part's line became a title), so
  // a keyboard and a screen reader go where the eye was taken
  const show = (part: Part | null) => {
    setOpen(part);
    if (!part) return;
    window.setTimeout(() => {
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      cards.current[part]?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
      heads.current[part]?.focus({ preventScroll: true });
    }, 360);
  };

  // The estimate as the packages stand this instant, and the one on the page
  // (`pricing`). The page's holds while the packages are still being typed
  // and lands a beat after the last change (PACE.settle): the figure isn't
  // another number on every keystroke, and its landing is one moment. A
  // service picked from its own priced card has nothing to wait for
  const live = packedPricing(check.originCountry, rate, packing);
  const liveKey = `${live.rate.id}:${live.packed}:${live.kg}:${live.rate.total}:${live.specialFromKg ?? ""}`;
  const [pricing, setPricing] = React.useState(live);
  const [pricedKey, setPricedKey] = React.useState(liveKey);
  if (pricing.rate.id !== live.rate.id) {
    setPricing(live);
    setPricedKey(liveKey);
  }
  const updating = pricedKey !== liveKey;
  React.useEffect(() => {
    if (pricedKey === liveKey) return;
    const id = window.setTimeout(() => {
      setPricing(packedPricing(check.originCountry, rate, packing));
      setPricedKey(liveKey);
    }, PACE.settle);
    return () => window.clearTimeout(id);
  }, [check.originCountry, rate, packing, liveKey, pricedKey]);
  // the estimate changed what it's priced on (the packages' weight came in
  // or went, another service was picked): the figure washes once and the
  // change is said. Its moving as a weight is typed is no news
  const basis = `${pricing.rate.id}:${pricing.packed}`;
  const [seenBasis, setSeenBasis] = React.useState(basis);
  const [flash, setFlash] = React.useState(0);
  const [announced, setAnnounced] = React.useState("");
  if (seenBasis !== basis) {
    setSeenBasis(basis);
    setFlash((n) => n + 1);
    setAnnounced(p("estimateUpdated").replace("{price}", formatIDR(pricing.rate.total)));
  }
  const said = saidBack(t, eligibility, details, packing);
  // a part opens once the ones above it are in
  const reachable = (part: Part) => PARTS.slice(0, PARTS.indexOf(part)).every((k) => done[k]);
  const blocked = open !== null && !done[open];
  // why the action waits. Your details names the first thing still missing,
  // in the order the page asks: its address card isn't a field, so "fill in
  // every field" left a filled-in form with no way to tell what was wanted
  const why = (part: Part) => {
    if (part !== "details") return p(HINT[part]);
    const dp = detailsProgress(details);
    // in the order the page asks
    const missing: [boolean, string][] = [
      [dp.name, "detailsName"],
      [dp.email, "detailsEmail"],
      [dp.phone, "detailsPhone"],
      [dp.pickup, "detailsPickup"],
    ];
    return p(missing.find(([ok]) => !ok)?.[1] ?? HINT.details);
  };
  // Confirm once nothing is left, or when the part in hand is the last left
  const last = todo === null || (blocked && PARTS.filter((k) => !done[k]).length === 1);

  const alive = React.useRef(true);
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const confirm = async () => {
    onSending(true);
    // the application takes its moment (pace.ts): the request, once there is
    // one, and its floor together, the plan standing still under a button
    // that says what's happening. Nothing is registered if the page was left
    await paced(undefined, PACE.confirm);
    if (!alive.current) return;
    const booking = submit();
    if (booking) {
      markJustBooked(booking.number);
      router.push(`/expat-relocation/booking/${booking.number}`);
    } else {
      // nothing was registered, and the draft is as it was
      onSending(false);
      toast.error(p("confirmFailed"));
    }
  };
  // The action pressed while its part still waits. It isn't disabled: a
  // dead button can't say what it wants. Everything missing is named where
  // it is (`tried`), the first of it is brought into view and into hand, and
  // a toast counts what's left
  const nudge = (part: Part) => {
    setTried((s) => ({ ...s, [part]: s[part] + 1 }));
    const go = () => {
      const first = cards.current[part]?.querySelector<HTMLElement>(MISSING);
      if (!first) return true;
      const target = first.matches(FOCUSABLE) ? first : first.querySelector<HTMLElement>(FOCUSABLE);
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      first.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" });
      target?.focus({ preventScroll: true });
      return document.activeElement === target;
    };
    // once the errors are on the page
    window.requestAnimationFrame(() => {
      const n = cards.current[part]?.querySelectorAll(MISSING).length ?? 0;
      // one toast, replaced by the next press
      toast.error(n === 1 ? p("missingOne") : n > 1 ? p("missingMany").replace("{n}", String(n)) : why(part), {
        id: "expat-plan-missing",
      });
      // a folded package is still unfolding: its field takes focus once it's open
      if (!go()) window.setTimeout(go, 360);
    });
  };
  const act = () => {
    if (open && !done[open]) nudge(open);
    else if (todo) show(todo);
    else void confirm();
  };
  const action = (
    <Button
      type="button"
      size="lg"
      loading={sending}
      aria-describedby={blocked ? "plan-hint" : undefined}
      onClick={act}
      className="w-full"
    >
      {sending ? p("confirming") : last ? p("confirm") : p("continue")} {!sending && !last && <ArrowRight />}
    </Button>
  );

  return (
    // the app's field, as Check Rate sits: white cards on Panel 2, with room
    // at the foot of a phone for the bar, two lines tall at its most. A field
    // in error wears Stop Red on its edge, so what the action counted can be
    // found down a long part
    <div data-field className="pb-44 lg:pb-20 [&_input[aria-invalid=true]]:border-danger">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 sm:pt-10">
        <h1 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">{p("title")}</h1>
        <p className="mt-3 max-w-xl text-pretty text-muted">{p("subtitle")}</p>

        <div className="mt-6 grid gap-4 sm:mt-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-12">
          {/* on a phone the service comes first, as a strip over the parts;
              its action is the bar's there */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:order-2">
            {/* still, while the application is being confirmed */}
            <div inert={sending} className={cn("transition-opacity duration-150", sending && "opacity-60")}>
              <SelectedService
                check={check}
                rate={pricing.rate}
                packed={pricing.packed}
                flash={flash}
                updating={updating}
                // the service changes here, in place; the answers stay
                action={
                  <ServicePicker
                    check={check}
                    pricing={pricing}
                    onSelect={(picked) => {
                      selectRate(checkedRate(check, picked));
                      // said in a toast: on a phone, deep in the form, the
                      // card that changed is off the screen
                      toast.success(t("expatOrder.service.changed").replace("{service}", `${picked.carrier} ${picked.service}`));
                    }}
                  />
                }
              />
            </div>
            <div className="hidden lg:block">
              {action}
              {/* seen here, said from the part's own foot (plan-hint) */}
              {blocked && open && (
                <p aria-hidden className="mt-2 text-xs text-muted">
                  {why(open)}
                </p>
              )}
            </div>
          </div>

          <div inert={sending} className={cn("min-w-0 transition-opacity duration-150 lg:order-1", sending && "opacity-60")}>
            <ol className="space-y-3">
              {PARTS.map((part, i) => {
                const isOpen = open === part;
                const isDone = done[part];
                const locked = !isOpen && !isDone && !reachable(part);
                const foldable = !isOpen && !locked;
                const id = `plan-${part}`;
                return (
                  <li key={part}>
                    <Card
                      ref={(el) => {
                        cards.current[part] = el;
                      }}
                      // one it can't reach yet stands back; it comes up as the part above is finished
                      className={cn(
                        "scroll-mt-24 px-5 transition-opacity duration-200 ease-(--ease-out-soft) sm:px-8",
                        locked && "opacity-60",
                      )}
                    >
                      <div className="relative flex items-start gap-3 py-5 sm:py-6">
                        <PartDot state={isDone ? "done" : isOpen ? "here" : "ahead"} n={i + 1} className="mt-1" />
                        <div className="min-w-0 flex-1">
                          <h2
                            ref={(el) => {
                              heads.current[part] = el;
                            }}
                            // takes focus when its part opens (show)
                            tabIndex={-1}
                            className="font-display text-xl font-semibold tracking-tight outline-none"
                          >
                            {foldable ? (
                              // the whole line reopens the part
                              <button
                                type="button"
                                aria-expanded={false}
                                aria-controls={id}
                                onClick={() => show(part)}
                                className="rounded-sm text-left after:absolute after:inset-0 after:rounded-md after:transition-colors active:after:bg-foreground/[0.04] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-foreground/50"
                              >
                                {t(`expatOrder.${part}.title`)}
                              </button>
                            ) : (
                              t(`expatOrder.${part}.title`)
                            )}
                            {isDone && <span className="sr-only"> ({p("done")})</span>}
                          </h2>
                          {/* folded, a part says itself back, in two lines at
                              most; open or ahead, what it asks, whole */}
                          <p className={cn("mt-1 text-sm text-muted", !isOpen && said[part] && "line-clamp-2")}>
                            {!isOpen && said[part] ? said[part] : t(`expatOrder.${part}.lead`)}
                          </p>
                        </div>
                        {foldable && (
                          <span aria-hidden className="link-mark mt-1 shrink-0 text-sm">
                            {isDone ? p("edit") : p("open")}
                          </span>
                        )}
                      </div>
                      <CollapseHeight open={isOpen} id={id}>
                        <div className="border-t border-border pb-6 pt-6 sm:pb-8">
                          <ReviewNote note={ORDER_REVIEW_NOTES[part]} className="mb-6" />
                          {part === "eligibility" && (
                            <>
                              <EligibilityStep value={eligibility} tried={tried.eligibility > 0} onChange={setEligibility} />
                              <div className="mt-8">
                                <CustomsPaths id="customs-paths" title={t("expatOrder.customs.title")} />
                              </div>
                            </>
                          )}
                          {part === "details" && (
                            <DetailsStep
                              check={check}
                              value={details}
                              changed={addressChanged}
                              tried={tried.details > 0}
                              onChange={setDetails}
                              // an Address changes in place: within its country it never moves the rate
                              onAddress={(side, place) => setCheck({ ...check, [side]: place })}
                            />
                          )}
                          {part === "packing" && (
                            <PackingStep
                              value={packing}
                              onChange={setPacking}
                              originCountry={check.originCountry}
                              checkedKg={check.weightKg ? chargedWeight(check.weightKg) : rate.chargedKg}
                              pricing={pricing}
                              tried={tried.packing}
                            />
                          )}
                          {/* why the action waits: read on a phone, where the
                              bar's button can't say; beside the form it shows
                              under the button */}
                          {isOpen && !isDone && (
                            <p id="plan-hint" className="mt-8 text-xs text-muted lg:sr-only">
                              {why(part)}
                            </p>
                          )}
                        </div>
                      </CollapseHeight>
                    </Card>
                  </li>
                );
              })}
            </ol>
            {/* the way back to Check Rate, to change the country or the weight
                (the service changes on the Selected Service) */}
            <Button asChild variant="ghost" className="mt-4">
              <Link href="/expat-relocation/rates">
                <ArrowLeft /> {p("back")}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* a phone: the estimate and the one action, always in reach */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
        {/* an amount is never cut: when the estimate and the button can't
            share the line (a narrow phone, a nine-figure estimate, "Confirm
            application"), the button takes the line under it, full width */}
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2">
          <div className="shrink-0">
            <p className="text-xs text-muted">{t(updating ? "expatOrder.service.updating" : "expatOrder.service.estimate")}</p>
            <p
              aria-busy={updating || undefined}
              className={cn(
                "whitespace-nowrap font-display text-lg font-bold tracking-tight tabular-nums transition-opacity duration-150",
                updating && "opacity-50",
              )}
            >
              <span key={flash} className={flash ? "estimate-flash" : undefined}>
                {formatIDR(pricing.rate.total)}
              </span>
            </p>
          </div>
          <div className="flex-1">{action}</div>
        </div>
      </div>

      {/* the estimate's change of basis, for who can't see the figure wash */}
      <p role="status" className="sr-only">
        {announced}
      </p>
    </div>
  );
}
