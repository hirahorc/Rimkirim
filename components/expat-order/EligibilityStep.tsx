"use client";

import * as React from "react";
import { ArrowUpRight, Check, PackageOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Field } from "@/components/shared/forms/Field";
import {
  ITEM_CATEGORIES,
  REASONS,
  STAY_LENGTHS,
  eligibilityProgress,
  todayIso,
  type EligibilityAnswers,
} from "@/lib/order/expat-order";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { CheckCards, RadioCards } from "./ChoiceCards";

/** one question: its number, its words, an optional line under them, then
 *  the answers; the words name the answer group. Answered, follow-ups
 *  included, the number gives way to the plan's done mark (lime, an Ink
 *  check), so what's left to answer is what still wears a number */
function Question({
  n,
  id,
  title,
  sub,
  done,
  children,
}: {
  n: number;
  id: string;
  title: string;
  sub?: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="border-t border-border pt-6 first:border-t-0 first:pt-0">
      <div className="flex gap-3">
        <span
          aria-hidden
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full font-display text-xs font-semibold tabular-nums",
            done ? "bg-brand text-brand-ink" : "bg-surface-2 text-foreground",
          )}
        >
          {done ? <Check className="size-3.5" strokeWidth={3} /> : n}
        </span>
        <div className="min-w-0 flex-1">
          <h3 id={id} className="font-display text-base font-semibold tracking-tight">
            {title}
          </h3>
          {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
          <div className="mt-4 space-y-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** An answer group, and what it says once the plan's action was pressed
 *  while it was still unanswered. The group carries `data-missing`: that's
 *  what the action looks for, to count what's left and go to the first. */
function Asked({ missing, children }: { missing?: string; children: React.ReactNode }) {
  return (
    <div data-missing={missing ? true : undefined}>
      {children}
      {missing && <p className="mt-2 text-xs text-danger">{missing}</p>}
    </div>
  );
}

/** a follow-up asked under its parent answer, stepped in so it reads as part
 *  of it */
function FollowUp({
  id,
  title,
  hint,
  missing,
  children,
}: {
  id: string;
  title: string;
  hint?: string;
  /** as Asked's */
  missing?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-missing={missing ? true : undefined} className="rounded-md bg-surface-2 px-4 py-4">
      <p id={id} className="text-sm font-medium">
        {title}
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      <div className="mt-3">{children}</div>
      {missing && <p className="mt-2 text-xs text-danger">{missing}</p>}
    </div>
  );
}

/**
 * The Eligibility Check: the epic's four questions in its words, each
 * follow-up opening under the answer that asks it. Changing an answer clears
 * the follow-ups it asked, so the ticket never mixes two stories. Nothing here
 * turns the customer away: what they pack, they pack themselves, and the
 * order goes on. `tried` is the plan's action pressed while a question was
 * still open: from then each unanswered group says so.
 */
export function EligibilityStep({
  value,
  tried = false,
  onChange,
}: {
  value: EligibilityAnswers;
  tried?: boolean;
  onChange: (patch: Partial<EligibilityAnswers>) => void;
}) {
  const t = useT();
  const e = (k: string) => t(`expatOrder.eligibility.${k}`);
  const yesNo = [
    { value: true, label: e("yes") },
    { value: false, label: e("no") },
  ];
  const furniture = value.items.includes("furniture");
  const answered = eligibilityProgress(value);
  /** what a group says once tried, while `unanswered` */
  const miss = (unanswered: boolean, k: string) => (tried && unanswered ? e(k) : undefined);

  return (
    <div className="space-y-6">
      <Question n={1} id="q1" title={e("q1")} sub={e("q1Sub")} done={answered.q1}>
        <Asked missing={miss(value.items.length === 0, "chooseSome")}>
          <CheckCards
            labelledBy="q1"
            value={value.items}
            onChange={(items) => onChange({ items, ...(items.includes("others") ? {} : { itemsOther: "" }) })}
            options={ITEM_CATEGORIES.map((c) => ({ value: c, label: e(`items.${c}`) }))}
          />
        </Asked>
        {value.items.includes("others") && (
          <Field
            label={e("itemsOther")}
            hint={miss(!value.itemsOther.trim(), "required") ? undefined : e("otherRequired")}
            error={miss(!value.itemsOther.trim(), "required")}
          >
            <Input
              value={value.itemsOther}
              onChange={(ev) => onChange({ itemsOther: ev.target.value })}
              placeholder={e("itemsOtherPh")}
              maxLength={120}
            />
          </Field>
        )}
        {/* who packs, for every customer and whatever they ship, so in the
            info tint: nothing they chose brought it on. Furniture only adds
            to its words and points at its own steps, so the notice never
            jumps or disappears as answers change */}
        <div role="status" className="flex gap-3 rounded-md bg-info/10 px-4 py-3.5">
          <PackageOpen aria-hidden className="mt-0.5 size-5 shrink-0 text-info" />
          <div className="text-sm">
            <p className="font-medium">{e("packTitle")}</p>
            <p className="mt-0.5 text-muted">
              {e("packBody").replace("{furniture}", furniture ? e("packFurniture") : "")}{" "}
              <a
                href={furniture ? "/expat-relocation#packing-furniture" : "/expat-relocation#packing"}
                target="_blank"
                rel="noreferrer"
                className="link-mark tap-row relative inline-flex items-center gap-0.5"
              >
                {e(furniture ? "packFurnitureLink" : "packLink")}
                <ArrowUpRight aria-hidden className="size-3.5" />
              </a>
            </p>
          </div>
        </div>
      </Question>

      <Question n={2} id="q2" title={e("q2")} done={answered.q2}>
        <Asked missing={miss(!value.location, "chooseOne")}>
          <RadioCards
            labelledBy="q2"
            value={value.location}
            onChange={(location) =>
              location !== value.location && onChange({ location, arrivalDate: undefined, stayLength: undefined })
            }
            options={[
              { value: "abroad" as const, label: e("abroad") },
              { value: "indonesia" as const, label: e("indonesia") },
            ]}
          />
        </Asked>
        {value.location === "abroad" && (
          <FollowUp id="q2-arrival" title={e("arrival")} missing={miss(!value.arrivalDate, "chooseDate")}>
            <DatePicker
              value={value.arrivalDate}
              onChange={(arrivalDate) => onChange({ arrivalDate })}
              min={todayIso()}
              placeholder={e("arrivalPh")}
              ariaLabel={e("arrival")}
            />
          </FollowUp>
        )}
        {value.location === "indonesia" && (
          <FollowUp id="q2-stay" title={e("stay")} missing={miss(!value.stayLength, "chooseOne")}>
            <RadioCards
              labelledBy="q2-stay"
              columns={4}
              value={value.stayLength}
              onChange={(stayLength) => onChange({ stayLength })}
              options={STAY_LENGTHS.map((s) => ({ value: s, label: e(`stays.${s}`) }))}
            />
          </FollowUp>
        )}
      </Question>

      <Question n={3} id="q3" title={e("q3")} done={answered.q3}>
        <Asked missing={miss(value.hasVisa === undefined, "chooseOne")}>
          <RadioCards
            labelledBy="q3"
            value={value.hasVisa}
            onChange={(hasVisa) =>
              hasVisa !== value.hasVisa && onChange({ hasVisa, hasVitas: undefined, hasItas: undefined })
            }
            options={yesNo}
          />
        </Asked>
        {value.hasVisa && (
          <div className="grid gap-3 sm:grid-cols-2">
            <FollowUp
              id="q3-vitas"
              title={e("vitas")}
              hint={e("vitasHint")}
              missing={miss(value.hasVitas === undefined, "chooseOne")}
            >
              <RadioCards labelledBy="q3-vitas" value={value.hasVitas} onChange={(hasVitas) => onChange({ hasVitas })} options={yesNo} />
            </FollowUp>
            <FollowUp
              id="q3-itas"
              title={e("itas")}
              hint={e("itasHint")}
              missing={miss(value.hasItas === undefined, "chooseOne")}
            >
              <RadioCards labelledBy="q3-itas" value={value.hasItas} onChange={(hasItas) => onChange({ hasItas })} options={yesNo} />
            </FollowUp>
          </div>
        )}
      </Question>

      <Question n={4} id="q4" title={e("q4")} sub={e("q4Sub")} done={answered.q4}>
        <Asked missing={miss(!value.reason, "chooseOne")}>
          <RadioCards
            labelledBy="q4"
            columns={3}
            value={value.reason}
            onChange={(reason) => onChange({ reason, ...(reason === "others" ? {} : { reasonOther: "" }) })}
            options={REASONS.map((r) => ({ value: r, label: e(`reasons.${r}`) }))}
          />
        </Asked>
        {value.reason === "others" && (
          <Field
            label={e("reasonOther")}
            hint={miss(!value.reasonOther.trim(), "required") ? undefined : e("otherRequired")}
            error={miss(!value.reasonOther.trim(), "required")}
          >
            <Input
              value={value.reasonOther}
              onChange={(ev) => onChange({ reasonOther: ev.target.value })}
              placeholder={e("reasonOtherPh")}
              maxLength={120}
            />
          </Field>
        )}
      </Question>
    </div>
  );
}
