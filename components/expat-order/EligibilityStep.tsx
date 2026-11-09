"use client";

import * as React from "react";
import { ArrowUpRight, PackageOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Field } from "@/components/shared/forms/Field";
import {
  ITEM_CATEGORIES,
  REASONS,
  STAY_LENGTHS,
  todayIso,
  type EligibilityAnswers,
} from "@/lib/order/expat-order";
import { useT } from "@/lib/i18n/LanguageProvider";
import { CheckCards, RadioCards } from "./ChoiceCards";

/** one question: its number, its words, an optional line under them, then
 *  the answers; the words name the answer group */
function Question({
  n,
  id,
  title,
  sub,
  children,
}: {
  n: number;
  id: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="border-t border-border pt-6 first:border-t-0 first:pt-0">
      <div className="flex gap-3">
        <span
          aria-hidden
          className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-2 font-display text-xs font-semibold tabular-nums text-foreground"
        >
          {n}
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

/** a follow-up asked under its parent answer, stepped in so it reads as part
 *  of it */
function FollowUp({ id, title, hint, children }: { id: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md bg-surface-2 px-4 py-4">
      <p id={id} className="text-sm font-medium">
        {title}
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

/**
 * The Eligibility Check: the epic's four questions in its words, each
 * follow-up opening under the answer that asks it. Changing an answer clears
 * the follow-ups it asked, so the ticket never mixes two stories. Nothing here
 * turns the customer away: furniture brings a notice and the order goes on.
 */
export function EligibilityStep({
  value,
  onChange,
}: {
  value: EligibilityAnswers;
  onChange: (patch: Partial<EligibilityAnswers>) => void;
}) {
  const t = useT();
  const e = (k: string) => t(`expatOrder.eligibility.${k}`);
  const yesNo = [
    { value: true, label: e("yes") },
    { value: false, label: e("no") },
  ];
  const furniture = value.items.includes("furniture");

  return (
    <div className="space-y-6">
      <Question n={1} id="q1" title={e("q1")} sub={e("q1Sub")}>
        <CheckCards
          labelledBy="q1"
          value={value.items}
          onChange={(items) => onChange({ items, ...(items.includes("others") ? {} : { itemsOther: "" }) })}
          options={ITEM_CATEGORIES.map((c) => ({ value: c, label: e(`items.${c}`) }))}
        />
        {value.items.includes("others") && (
          <Field label={e("itemsOther")} hint={e("otherRequired")}>
            <Input
              value={value.itemsOther}
              onChange={(ev) => onChange({ itemsOther: ev.target.value })}
              placeholder={e("itemsOtherPh")}
              maxLength={120}
            />
          </Field>
        )}
        {/* the epic's warning, in the app's warning tint: not an error (the
            customer did nothing wrong) and never a block */}
        {furniture && (
          <div role="status" className="flex gap-3 rounded-md bg-warning/10 px-4 py-3.5">
            <PackageOpen aria-hidden className="mt-0.5 size-5 shrink-0 text-warning" />
            <div className="text-sm">
              <p className="font-medium">{e("furnitureTitle")}</p>
              <p className="mt-0.5 text-muted">
                {e("furnitureBody")}{" "}
                <a
                  href="/expat-relocation#packing-furniture"
                  target="_blank"
                  rel="noreferrer"
                  className="link-mark tap-row relative inline-flex items-center gap-0.5"
                >
                  {e("furnitureLink")}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </a>
              </p>
            </div>
          </div>
        )}
      </Question>

      <Question n={2} id="q2" title={e("q2")}>
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
        {value.location === "abroad" && (
          <FollowUp id="q2-arrival" title={e("arrival")}>
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
          <FollowUp id="q2-stay" title={e("stay")}>
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

      <Question n={3} id="q3" title={e("q3")}>
        <RadioCards
          labelledBy="q3"
          value={value.hasVisa}
          onChange={(hasVisa) =>
            hasVisa !== value.hasVisa && onChange({ hasVisa, hasVitas: undefined, hasItas: undefined })
          }
          options={yesNo}
        />
        {value.hasVisa && (
          <div className="grid gap-3 sm:grid-cols-2">
            <FollowUp id="q3-vitas" title={e("vitas")} hint={e("vitasHint")}>
              <RadioCards labelledBy="q3-vitas" value={value.hasVitas} onChange={(hasVitas) => onChange({ hasVitas })} options={yesNo} />
            </FollowUp>
            <FollowUp id="q3-itas" title={e("itas")} hint={e("itasHint")}>
              <RadioCards labelledBy="q3-itas" value={value.hasItas} onChange={(hasItas) => onChange({ hasItas })} options={yesNo} />
            </FollowUp>
          </div>
        )}
      </Question>

      <Question n={4} id="q4" title={e("q4")} sub={e("q4Sub")}>
        <RadioCards
          labelledBy="q4"
          columns={3}
          value={value.reason}
          onChange={(reason) => onChange({ reason, ...(reason === "others" ? {} : { reasonOther: "" }) })}
          options={REASONS.map((r) => ({ value: r, label: e(`reasons.${r}`) }))}
        />
        {value.reason === "others" && (
          <Field label={e("reasonOther")} hint={e("otherRequired")}>
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
