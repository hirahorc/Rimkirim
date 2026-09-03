"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  MessageCircle,
  PackageX,
  Globe2,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useOrderStore } from "@/lib/store/useOrderStore";
import type { Citizenship } from "@/lib/store/useOrderStore";
import { getCountry } from "@/lib/data/countries";
import { validatePackingCode } from "@/lib/data/packing-list";
import { findOwnedByCode } from "@/lib/store/usePackingListStore";
import { mapPackingToModules } from "@/lib/order/packing-prefill";
import { useCurrentUser } from "@/lib/store/useAuthStore";
import { toast } from "sonner";
import { useT, useLanguage } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { InfoTip, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import { formatIDR } from "@/lib/utils/currency";
import { RouteArrow } from "@/components/ui/route-arrow";
import { WA_URL } from "@/lib/contact";

/**
 * A yes/no (or A/B) answer as two standalone buttons side by side — not a
 * segmented toggle: each answer is its own pressable card, and the chosen one
 * fills with lime. Real radio semantics stay: the group is labelled by its
 * question, arrows move the choice, roving tabindex.
 */
function Choice<T extends string | boolean>({
  value,
  onChange,
  options,
  labelledBy,
}: {
  value: T | undefined;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  /** id of the question text that names this group */
  labelledBy: string;
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIdx = options.findIndex((o) => o.value === value);
  const move = (from: number, dir: 1 | -1) => {
    const next = (from + dir + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className="mt-3 grid grid-cols-2 gap-2"
    >
      {options.map((o, i) => {
        const checked = value === o.value;
        // roving tabindex: the checked item (or the first, before any answer) is the tab stop
        const tabStop = selectedIdx === -1 ? i === 0 : checked;
        return (
          <button
            key={String(o.value)}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={tabStop ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(ev) => {
              if (ev.key === "ArrowRight" || ev.key === "ArrowDown") {
                ev.preventDefault();
                move(i, 1);
              } else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") {
                ev.preventDefault();
                move(i, -1);
              } else if (ev.key === " " || ev.key === "Enter") {
                ev.preventDefault();
                onChange(o.value);
              }
            }}
            className={cn(
              "rounded-md border px-4 py-2.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50",
              checked
                ? "border-brand bg-brand text-brand-ink"
                : "border-border bg-surface-2 text-muted hover:border-border-strong hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Question({
  n,
  question,
  note,
  children,
  answered,
  editLabel,
}: {
  n: number;
  question: string;
  /** small eyebrow naming what the answer does (e.g. "decides the clearance route") */
  note?: string;
  children: React.ReactNode;
  /** the chosen answer's label: when set and the question is behind the active
      one, the card folds to a single line (question · answer · Ubah) */
  answered?: string;
  editLabel?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [editing, setEditing] = React.useState(false);
  const folded = !!answered && !editing;
  // a question that appears below the fold on a phone announces itself by
  // sliding into view; mount-only, and skipped when motion is reduced
  React.useEffect(() => {
    if (n === 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.bottom > window.innerHeight)
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [n]);
  if (folded) {
    return (
      <Card
        ref={ref}
        id={`q${n}`}
        className="rounded-md scroll-mt-28 flex flex-col gap-1 px-5 py-3 text-sm sm:flex-row sm:items-center sm:gap-3"
      >
        <span className="flex min-w-0 flex-1 gap-2">
          <span className="tabular-nums text-muted-2">{n}.</span>
          {/* phones keep the whole question (2 lines); desktop has room on one line */}
          <span className="min-w-0 flex-1 text-muted line-clamp-2 sm:truncate">
            {question}
          </span>
        </span>
        <span className="flex items-center gap-3 pl-5 sm:pl-0">
          <span className="shrink-0 font-medium text-foreground">
            {answered}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="link-mark shrink-0 text-xs"
          >
            {editLabel}
          </button>
        </span>
      </Card>
    );
  }
  return (
    // id lets the clearance step deep-link back to the exact question
    <Card ref={ref} id={`q${n}`} className="scroll-mt-28 animate-fade-up p-5 pt-7">
      {note && (
        <p className="mb-1 font-display text-xs font-medium uppercase tracking-[0.04em] text-muted-2">
          {note}
        </p>
      )}
      <p id={`q${n}-label`} className="flex gap-2 font-medium">
        <span className="tabular-nums text-foreground">{n}.</span>
        <span>{question}</span>
      </p>
      {children}
    </Card>
  );
}

export function Questionnaire() {
  const t = useT();
  const { locale } = useLanguage();
  const router = useRouter();
  const context = useOrderStore((s) => s.context);
  const selectedRate = useOrderStore((s) => s.selectedRate);
  const answers = useOrderStore((s) => s.answers);
  const setAnswers = useOrderStore((s) => s.setAnswers);
  const prefillFromPackingList = useOrderStore((s) => s.prefillFromPackingList);
  const user = useCurrentUser();

  const [codeStatus, setCodeStatus] = React.useState<
    "idle" | "checking" | "found" | "not-found"
  >(() =>
    answers.packingCode?.trim() &&
    answers.packingCodeVerified === answers.packingCode.trim()
      ? "found"
      : "idle",
  );

  const checkCode = async () => {
    const code = (answers.packingCode ?? "").trim();
    if (!code) return;
    setCodeStatus("checking");
    const ok = await validatePackingCode(code, user?.email);
    setCodeStatus(ok ? "found" : "not-found");
    // remember the verified code so a reload doesn't ask to search again
    setAnswers({ packingCodeVerified: ok ? code : undefined });
  };

  const isExport = context?.service === "moving-abroad";

  const a = answers.shippingPersonal;
  const b = answers.citizenship;
  const c = answers.livedLongEnough;
  const d = answers.canApplySKP;
  const e = answers.hasPackingCode;
  const arrived = answers.arrivedAtDestination;

  // country names in the reader's language ("Belanda", not "Netherlands" inside ID copy)
  const countryName = (code: string | undefined | null) => {
    if (!code) return "–";
    try {
      return (
        new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code
      );
    } catch {
      return getCountry(code)?.name ?? code;
    }
  };
  const originName = countryName(context?.originCountry);
  const destName = countryName(context?.destCountry);

  const packingCodeOk = e === false || codeStatus === "found";

  // how far along, out of the longest path this service can take: the count
  // shrinks the moment a branch closes, so the horizon is always honest
  const maxQuestions = isExport
    ? 3
    : a === false
      ? 1
      : b === "foreigner"
        ? 2
        : 5;
  const answeredCount = [a, isExport ? arrived : b, c, d, e].filter(
    (v) => v !== undefined,
  ).length;
  const answeredShown = Math.min(answeredCount, maxQuestions);
  // the lime door only leads forward; a branch that ends in a hand-off gets a
  // quieter, honest button (and says so under the answer that caused it)
  // the lane the routing answers are forming, said out loud under Q3/Q4 so a
  // "Tidak" is never a mystery: it's a different lane, not a rejection
  const laneText =
    c === false || d === false
      ? t("order.qLanePassenger")
      : c === true && d === true
        ? t("order.qLanePersonal")
        : t("order.qLaneOpen");
  const laneReadout = (
    <p
      role="status"
      className="mt-3 inline-flex max-w-full items-center gap-2 rounded-sm bg-surface-2 px-3 py-1.5 text-sm text-foreground"
    >
      <ArrowRight className="size-4 shrink-0 text-muted-2" aria-hidden />
      <span className="min-w-0">{laneText}</span>
    </p>
  );
  // the off-ramp IS the outcome: the card appears the moment the answer lands
  const offRamp: "ineligible" | "foreigner" | null =
    a === false
      ? "ineligible"
      : !isExport && b === "foreigner"
        ? "foreigner"
        : null;
  const outcome = offRamp;
  // questions behind the active one fold to a line; the active one stays open
  const activeN = isExport
    ? a === undefined
      ? 1
      : arrived === undefined
        ? 2
        : 3
    : a === undefined
      ? 1
      : b === undefined
        ? 2
        : c === undefined
          ? 3
          : d === undefined
            ? 4
            : 5;
  const fold = (n: number, label: string | undefined) =>
    n < activeN && !offRamp ? label : undefined;

  const canSubmit = isExport
    ? a === false ||
      (a === true && arrived !== undefined && e !== undefined && packingCodeOk)
    : a === false ||
      (a === true && b === "foreigner") ||
      (a === true &&
        b === "indonesian" &&
        c !== undefined &&
        d !== undefined &&
        e !== undefined &&
        packingCodeOk);

  // a code from one of the user's own packing lists carries its data along:
  // CI + Items land in the form pre-filled instead of being typed twice
  const applyOwnPackingList = () => {
    if (e !== true || codeStatus !== "found") return;
    const own = findOwnedByCode(user?.email, answers.packingCode ?? "");
    if (!own) return;
    prefillFromPackingList(mapPackingToModules(own.data, context));
    toast.success(t("pl.prefilledToast"), {
      description: t("pl.prefilledToastBody").replace("{code}", own.code),
    });
  };

  const onSubmit = () => {
    if (offRamp) return;
    applyOwnPackingList();
    if (isExport) return router.push("/pesan/modul");
    router.push("/pesan/clearance");
  };

  const packingReveal = e === true && (
    <div className="mt-3">
      <Label className="inline-flex items-center gap-1.5">
        {t("order.packingCodeLabel")}
        <InfoTip
          content={t("order.qPackingTip")}
          label={t("order.packingCodeLabel")}
        />
      </Label>
      <div className="flex gap-2">
        <Input
          value={answers.packingCode ?? ""}
          onChange={(ev) => {
            setAnswers({ packingCode: ev.target.value });
            setCodeStatus("idle");
          }}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              ev.preventDefault();
              checkCode();
            }
          }}
          placeholder={t("order.packingCodePlaceholder")}
          className="flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={checkCode}
          loading={codeStatus === "checking"}
          disabled={!answers.packingCode?.trim()}
          className="h-11 shrink-0"
        >
          {codeStatus !== "checking" && <Search className="size-4" />}
          {t("order.packingCodeSearch")}
        </Button>
      </div>
      {codeStatus === "idle" && (
        <p className="mt-1.5 text-xs text-muted-2">
          {t("order.packingCodeHint")}{" "}
          <Link href="/packing-list" className="link-mark">
            {t("order.packingCodeIdleMake")}
          </Link>
        </p>
      )}
      {codeStatus === "checking" && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
          <Loader2 className="size-3.5 animate-spin" />
          {t("order.packingCodeChecking")}
        </p>
      )}
      {codeStatus === "found" && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-success">
          <CheckCircle2 className="size-3.5" />
          {t("order.packingCodeFound")}
        </p>
      )}
      {codeStatus === "not-found" && (
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-danger">
          <span className="inline-flex items-center gap-1.5">
            <XCircle className="size-3.5" />
            {t("order.packingCodeNotFound")}
          </span>
          <Link href="/packing-list" className="link-mark">
            {t("order.packingCodeMakeOne")}
          </Link>
        </p>
      )}
    </div>
  );

  // the hand-off dialog: a vaul sheet on phones, centred modal on desktop.
  // Dismissing it any way (drag, X, esc, overlay) = "Ubah jawaban": the
  // routing answer is cleared so the form comes back live.
  const outcomeProps =
    outcome === "ineligible"
      ? {
          icon: <PackageX />,
          title: t("order.ineligibleTitle"),
          body: t("order.ineligibleBody"),
          echo: `${t("order.qYourAnswer")}: ${t("order.no")}`,
          primary: {
            label: t("order.ineligibleCta"),
            href: WA_URL,
            external: true,
            tone: "secondary" as const,
            icon: <MessageCircle className="size-4" />,
          },
          secondaryLabel: t("order.backToRates"),
          onSecondary: () => setAnswers({ shippingPersonal: undefined }),
        }
      : outcome === "foreigner"
        ? {
            icon: <Globe2 />,
            title: t("order.foreignerTitle"),
            body: t("order.foreignerBody"),
            echo: `${t("order.qYourAnswer")}: ${t("order.foreigner")}`,
            primary: {
              label: t("order.foreignerCta"),
              href: "/expat-relocation",
              external: false,
              icon: <ArrowRight className="size-4" />,
            },
            secondaryLabel: t("order.backToRates"),
            onSecondary: () => setAnswers({ citizenship: undefined }),
          }
        : null;
  // retain the last outcome's content while the dialog animates closed
  const lastOutcome = React.useRef(outcomeProps);
  if (outcomeProps) lastOutcome.current = outcomeProps;
  const shownOutcome = outcomeProps ?? lastOutcome.current;
  const outcomeCard = shownOutcome ? (
    <OutcomeScreen {...shownOutcome} open={!!outcome} />
  ) : null;

  return (
    <TooltipProvider delayDuration={150}>
      <div>
        {/* no manual dim/inert here: the outcome dialog's overlay covers the
            form, and radix/vaul make the page behind it inert themselves */}
        <div>
          {/* left on phones, centred from sm up — the flow's shared header
              alignment (same on /pesan/clearance and /pesan/modul) */}
          <header className="mb-6 sm:text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("order.qHeading")}
            </h1>
            <p className="mt-1.5 max-w-prose text-sm text-muted sm:mx-auto">
              {t("order.qSubheading")}
            </p>
            {/* the shipment this check is about: the Open Desk readout the page
                was missing (route · service · quoted rate) */}
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground sm:justify-center">
              <Link
                href="/cek-tarif"
                className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                title={t("order.qReceiptBack")}
              >
                {originName}
                <RouteArrow className="text-muted-2" />
                {destName}
              </Link>
              <span className="text-muted-2">·</span>
              <span>
                {isExport ? t("order.serviceMa") : t("order.serviceBfg")}
              </span>
              {selectedRate && (
                <>
                  <span className="text-muted-2">·</span>
                  <span className="font-mono tabular-nums">
                    {formatIDR(selectedRate.perKg)}
                    <span className="ml-1 text-xs text-muted-2">
                      {t("order.qPerKg")}
                    </span>
                  </span>
                </>
              )}
            </p>
            {maxQuestions > 1 && (
              <p className="mt-3 font-display text-xs font-medium uppercase tracking-[0.04em] text-muted-2">
                {t("order.qProgress")
                  .replace("{n}", String(answeredShown))
                  .replace("{max}", String(maxQuestions))}
              </p>
            )}
          </header>

          <div className="space-y-3">
            <Question
              n={1}
              note={t("order.qGateNote")}
              question={t("order.qA")}
              answered={fold(
                1,
                a === undefined
                  ? undefined
                  : a
                    ? t("order.yes")
                    : t("order.no"),
              )}
              editLabel={t("order.qEdit")}
            >
              {/* the gate term, defined where it's asked (same treatment as SKP) */}
              <p className="mt-1.5 text-xs text-muted-2">
                {t("order.qAGloss")}
              </p>
              <Choice
                labelledBy={`q1-label`}
                value={a}
                onChange={(v) => setAnswers({ shippingPersonal: v })}
                options={[
                  { value: true, label: t("order.yes") },
                  { value: false, label: t("order.no") },
                ]}
              />
            </Question>

            {/* Moving Abroad (export): lean questionnaire */}
            {a === true && isExport && (
              <>
                <Question
                  n={2}
                  answered={fold(
                    2,
                    arrived === undefined
                      ? undefined
                      : arrived
                        ? t("order.yes")
                        : t("order.no"),
                  )}
                  editLabel={t("order.qEdit")}
                  question={`${t("order.qArrivedPre")} ${destName} ${t("order.qArrivedPost")}`}
                >
                  <Choice
                    labelledBy={`q2-label`}
                    value={arrived}
                    onChange={(v) => setAnswers({ arrivedAtDestination: v })}
                    options={[
                      { value: true, label: t("order.yes") },
                      { value: false, label: t("order.no") },
                    ]}
                  />
                </Question>

                <Question
                  n={3}
                  note={t("order.qOptionalNote")}
                  answered={fold(3, e === false ? t("order.no") : undefined)}
                  editLabel={t("order.qEdit")}
                  question={t("order.qE")}
                >
                  <Choice
                    labelledBy={`q3-label`}
                    value={e}
                    onChange={(v) => setAnswers({ hasPackingCode: v })}
                    options={[
                      { value: true, label: t("order.yes") },
                      { value: false, label: t("order.no") },
                    ]}
                  />
                  {packingReveal}
                </Question>
              </>
            )}

            {/* Back For Good (import): full eligibility questionnaire */}
            {a === true && !isExport && (
              <Question
                n={2}
                note={t("order.qGateNote")}
                answered={fold(
                  2,
                  b === undefined
                    ? undefined
                    : b === "indonesian"
                      ? t("order.indonesian")
                      : t("order.foreigner"),
                )}
                editLabel={t("order.qEdit")}
                question={t("order.qB")}
              >
                <Choice<Citizenship>
                  labelledBy={`q2-label`}
                  value={b}
                  onChange={(v) => setAnswers({ citizenship: v })}
                  options={[
                    { value: "indonesian", label: t("order.indonesian") },
                    { value: "foreigner", label: t("order.foreigner") },
                  ]}
                />
              </Question>
            )}

            {a === true && !isExport && b === "indonesian" && (
              <>
                <Question
                  n={3}
                  note={t("order.qRoutingNote")}
                  answered={fold(
                    3,
                    c === undefined
                      ? undefined
                      : c
                        ? t("order.yes")
                        : t("order.no"),
                  )}
                  editLabel={t("order.qEdit")}
                  question={`${t("order.qCPre")} ${originName} ${t("order.qCPost")}`}
                >
                  {/* the stakes, before the answer: "Tidak" is a lane, not a rejection */}
                  <p className="mt-1.5 text-xs text-muted-2">
                    {t("order.qCGloss")}
                  </p>
                  <Choice
                    labelledBy={`q3-label`}
                    value={c}
                    onChange={(v) => setAnswers({ livedLongEnough: v })}
                    options={[
                      { value: true, label: t("order.yes") },
                      { value: false, label: t("order.no") },
                    ]}
                  />
                </Question>

                {/* one question at a time: the next card appears once this one is answered */}
                {c !== undefined && (
                  <Question
                    n={4}
                    note={t("order.qRoutingNote")}
                    answered={fold(
                      4,
                      d === undefined
                        ? undefined
                        : d
                          ? t("order.yes")
                          : t("order.no"),
                    )}
                    editLabel={t("order.qEdit")}
                    question={t("order.qD")}
                  >
                    {/* SKP is the one term here a first-timer won't know — explain
                  it right where it's asked, not behind a tap */}
                    <p className="mt-1.5 text-xs text-muted-2">
                      {t("order.jargSkp")}
                    </p>
                    <Choice
                      labelledBy={`q4-label`}
                      value={d}
                      onChange={(v) => setAnswers({ canApplySKP: v })}
                      options={[
                        { value: true, label: t("order.yes") },
                        { value: false, label: t("order.no") },
                      ]}
                    />
                  </Question>
                )}

                {/* the lane formed so far, outside the cards so it survives folding:
                    after Q3 (what's still open) and after Q4 (the resolved lane) */}
                {c !== undefined && !canSubmit && laneReadout}

                {c !== undefined && d !== undefined && (
                  <Question
                    n={5}
                    note={t("order.qOptionalNote")}
                    answered={fold(5, e === false ? t("order.no") : undefined)}
                    editLabel={t("order.qEdit")}
                    question={t("order.qE")}
                  >
                    <Choice
                      labelledBy={`q5-label`}
                      value={e}
                      onChange={(v) => setAnswers({ hasPackingCode: v })}
                      options={[
                        { value: true, label: t("order.yes") },
                        { value: false, label: t("order.no") },
                      ]}
                    />
                    {packingReveal}
                  </Question>
                )}
              </>
            )}
          </div>

          {/* the action block steps aside when the outcome card has taken over */}
          <div className={cn("mt-6", outcome && "hidden")}>
            {canSubmit && !offRamp && (
              <p className="mx-auto mb-3 flex w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 rounded-md bg-surface-2 px-4 py-2.5 text-center text-sm font-medium text-foreground">
                <CheckCircle2 className="size-3.5 text-success" />{" "}
                {t("order.qEligibleReadout")}
                <span className="block w-full font-normal text-muted">
                  {isExport
                    ? ""
                    : c === true && d === true
                      ? t("order.qEligibleLanePersonal")
                      : t("order.qEligibleLanePassenger")}
                </span>
              </p>
            )}
            {!canSubmit && (
              <p
                id="q-submit-hint"
                role="status"
                className="mb-2 text-center text-xs text-muted-2"
              >
                {e === true && codeStatus === "not-found"
                  ? t("order.qBadCodeHint")
                  : e === true &&
                      !!answers.packingCode?.trim() &&
                      codeStatus !== "found"
                    ? t("order.qCheckCodeHint")
                    : t("order.qAnswerAllHint")}
              </p>
            )}
            <Button
              size="lg"
              // lime means "forward"; an off-ramp and a not-yet both wear the secondary coat
              variant={canSubmit && !offRamp ? "brand" : "secondary"}
              className="w-full"
              disabled={!canSubmit}
              aria-describedby={canSubmit ? undefined : "q-submit-hint"}
              onClick={onSubmit}
            >
              {t("order.seeResult")}
              <ArrowRight className="size-4" />
            </Button>
            {canSubmit && !offRamp && (
              <p className="mt-3 text-center text-xs leading-relaxed text-muted-2">
                {t("order.qAgreePre")}{" "}
                <Link href="/terms" className="link-mark">
                  {t("footer.legalTerms")}
                </Link>{" "}
                {t("order.qAgreeMid")}{" "}
                <Link href="/privacy" className="link-mark">
                  {t("footer.legalPrivacy")}
                </Link>
                {t("order.qAgreePost")}
              </p>
            )}
          </div>
        </div>
        {outcomeCard}
      </div>
    </TooltipProvider>
  );
}

function OutcomeScreen({
  icon,
  title,
  body,
  echo,
  primary,
  secondaryLabel,
  onSecondary,
  open,
}: {
  /** inline beside the title, like every other action dialog in the family */
  icon: React.ReactNode;
  title: string;
  body: string;
  /** the answer that routed them here, repeated so the hand-off has a reason */
  echo: string;
  primary: {
    label: string;
    href: string;
    external: boolean;
    icon: React.ReactNode;
    /** lime means "forward"; a hand-off (WhatsApp) wears the secondary coat */
    tone?: "brand" | "secondary";
  };
  secondaryLabel: string;
  /** clears the routing answer — also what any dismissal maps to */
  onSecondary: () => void;
  open: boolean;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onSecondary();
      }}
    >
      <DialogContent>
        {/* no eyebrow: the icon-led title carries the moment by itself */}
        <DialogHeader>
          <DialogTitle>
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription className="mt-1.5">{body}</DialogDescription>
          <p className="mt-2 text-xs text-muted-2">{echo}</p>
        </DialogHeader>
        {/* DOM order [ghost, primary] so the sheet's flex-col-reverse
            stacks primary on top; on desktop the ghost sits apart on the left */}
        <DialogFooter>
          <Button
            variant="ghost"
            className="sm:mr-auto"
            onClick={onSecondary}
          >
            {secondaryLabel}
          </Button>
          <Button asChild variant={primary.tone ?? "brand"}>
            {primary.external ? (
              <a href={primary.href} target="_blank" rel="noreferrer">
                {primary.icon} {primary.label}
              </a>
            ) : (
              <Link href={primary.href}>
                {primary.icon} {primary.label}
              </Link>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
