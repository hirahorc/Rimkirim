"use client";

import * as React from "react";
import { ArrowUpRight, Ban, Car, Flame, PackageOpen, Wine, type LucideIcon } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { CollapseHeight } from "@/components/ui/disclosure";
import {
  BLOCKED_ITEMS,
  ITEM_CATEGORIES,
  REASONS,
  eligibilityProgress,
  todayIso,
  type BlockedItem,
  type EligibilityAnswers,
} from "@/lib/order/expat-order";
import { useT } from "@/lib/i18n/LanguageProvider";
import { CheckCards, RadioCards } from "./ChoiceCards";
import { Done, Field, Note, TYPE, Well, Wrong } from "./kit";

/** one question: its number, its words, an optional line under them, then
 *  the answers across the part's whole width; the words name the answer
 *  group. Answered, follow-ups included, the number gives way to the done
 *  mark (an Ink check), so what's left to answer is what still wears a
 *  number */
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
    <section aria-labelledby={id}>
      <div className="flex gap-2">
        {/* the title's line, so the mark sits on its first */}
        <span aria-hidden className="flex h-6 w-4 shrink-0 items-center justify-center text-xs font-medium tabular-nums text-muted">
          {done ? <Done className="text-foreground" /> : n}
        </span>
        <div className="min-w-0">
          <h3 id={id} className={TYPE.subhead}>
            {title}
          </h3>
          {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4">{children}</div>
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
      <Wrong className="mt-2">{missing}</Wrong>
    </div>
  );
}

/** What an answer asks next, under it. It stays mounted and opens with the
 *  disclosure's height motion, so the questions below glide down instead of
 *  jumping; closed, it's inert and hidden, and a draft that already has the
 *  answer opens with it standing. (A little room around it, so a focus ring
 *  isn't cut by the panel's edge.) */
function Under({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div className="-mx-1">
      <CollapseHeight open={open} className="px-1 pb-1 pt-4">
        {children}
      </CollapseHeight>
    </div>
  );
}

/** a follow-up asked under its parent answer: its words a step below the
 *  question's and close under the answer that asks it, so it reads as part
 *  of it without a box of its own */
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
    <div data-missing={missing ? true : undefined}>
      <p id={id} className="text-sm font-medium">
        {title}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      <div className="mt-2">{children}</div>
      <Wrong className="mt-2">{missing}</Wrong>
    </div>
  );
}

/** what can't be shipped, each with its picture */
const BLOCKED_ICON: Record<BlockedItem, LucideIcon> = { vehicle: Car, excise: Wine, hazard: Flame };

/** a thing that can't go, in its ring and struck through in red, as the
 *  landing's "Not allowed" list draws it (the one red in the flow that isn't
 *  an error or the Special Rate: it's there so it's seen) */
function Struck({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span
      aria-hidden
      className="relative grid size-8 shrink-0 place-items-center rounded-full border-[1.5px] border-danger/75 bg-background"
    >
      <Icon className="size-4" strokeWidth={1.75} />
      <span className="absolute inset-x-0.5 top-1/2 h-[1.5px] -translate-y-1/2 rotate-45 rounded-full bg-danger/75" />
    </span>
  );
}

/**
 * The Eligibility Check: the epic's four questions in its words, each
 * follow-up opening under the answer that asks it. Changing an answer clears
 * the follow-ups it asked, so the ticket never mixes two stories. Nothing here
 * turns the customer away: what they pack, they pack themselves, and the
 * order goes on. What no customs path lets in (the PM's rule v1) is told
 * right under Q1's categories, where what's shipping is decided: each thing
 * pictured and struck through, and the way to the full list. Q2 asks a date
 * in both branches, the arrival ahead or the one already made. `tried` is the plan's action pressed while
 * a question was still open: from then each unanswered group says so.
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
  // what each answer asks next: all of it is on the page (Under), so only
  // what its answer called for can be missing
  const othersItems = value.items.includes("others");
  const abroad = value.location === "abroad";
  const inIndonesia = value.location === "indonesia";
  const visa = value.hasVisa === true;
  const otherReason = value.reason === "others";
  const itemsOtherErr = miss(othersItems && !value.itemsOther.trim(), "required");
  const reasonOtherErr = miss(otherReason && !value.reasonOther.trim(), "required");

  return (
    <div className="grid grid-cols-1 gap-8">
      <Question n={1} id="q1" title={e("q1")} sub={e("q1Sub")} done={answered.q1}>
        <div>
          <Asked missing={miss(value.items.length === 0, "chooseSome")}>
            <CheckCards
              labelledBy="q1"
              value={value.items}
              onChange={(items) => onChange({ items, ...(items.includes("others") ? {} : { itemsOther: "" }) })}
              options={ITEM_CATEGORIES.map((c) => ({ value: c, label: e(`items.${c}`) }))}
            />
          </Asked>
          <Under open={othersItems}>
            <Field label={e("itemsOther")} hint={itemsOtherErr ? undefined : e("otherRequired")} error={itemsOtherErr}>
              <Well
                value={value.itemsOther}
                onChange={(ev) => onChange({ itemsOther: ev.target.value })}
                placeholder={e("itemsOtherPh")}
                maxLength={120}
              />
            </Field>
          </Under>
        </div>
        {/* what no customs path lets in, told where what's shipping is
            decided, first under the choice: fenced as anything told is, its
            things pictured and struck through so they're seen before
            they're read, and the way to everything else that can't go */}
        <section aria-labelledby="q1-blocked" className="flex gap-2 rounded-md border border-border px-4 py-3 text-sm">
          <span className="flex h-5 shrink-0 items-center">
            <Ban aria-hidden className="size-4 text-danger" strokeWidth={2.25} />
          </span>
          <div className="min-w-0 flex-1">
            <h4 id="q1-blocked" className="font-medium">
              {e("blockedTitle")}
            </h4>
            <p className="mt-1 text-muted">{e("blockedBody")}</p>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {BLOCKED_ITEMS.map((b) => (
                <li key={b} className="flex items-center gap-3 font-medium">
                  <Struck icon={BLOCKED_ICON[b]} />
                  {e(`blockedItems.${b}`)}
                </li>
              ))}
            </ul>
            <a
              href="/expat-relocation#not-allowed"
              target="_blank"
              rel="noreferrer"
              className="link-mark tap-row relative mt-3 inline-flex items-center gap-1"
            >
              {e("blockedLink")}
              <ArrowUpRight aria-hidden className="size-3.5" />
            </a>
          </div>
        </section>
        {/* who packs, for every customer and whatever they ship: told, not
            asked, and nothing they chose brought it on. Furniture only adds
            to its words and points at its own steps, so the notice never
            jumps or disappears as answers change */}
        <Note icon={PackageOpen} title={e("packTitle")}>
          <p className="mt-1 text-muted">
            {e("packBody").replace("{furniture}", furniture ? e("packFurniture") : "")}{" "}
            {/* the largest a package can be, whatever is shipping */}
            {e("packSize")}{" "}
            <a
              href={furniture ? "/expat-relocation#packing-furniture" : "/expat-relocation#packing"}
              target="_blank"
              rel="noreferrer"
              className="link-mark tap-row relative inline-flex items-center gap-1"
            >
              {e(furniture ? "packFurnitureLink" : "packLink")}
              <ArrowUpRight aria-hidden className="size-3.5" />
            </a>
          </p>
        </Note>
      </Question>

      <Question n={2} id="q2" title={e("q2")} sub={e("q2Sub")} done={answered.q2}>
        <div>
          <Asked missing={miss(!value.location, "chooseOne")}>
            <RadioCards
              labelledBy="q2"
              value={value.location}
              onChange={(location) =>
                location !== value.location && onChange({ location, arrivalDate: undefined })
              }
              options={[
                { value: "abroad" as const, label: e("abroad") },
                { value: "indonesia" as const, label: e("indonesia") },
              ]}
            />
          </Asked>
          <Under open={abroad}>
            <FollowUp
              id="q2-arrival"
              title={e("arrival")}
              hint={e("arrivalHint")}
              missing={miss(abroad && !value.arrivalDate, "chooseDate")}
            >
              <DatePicker
                value={value.arrivalDate}
                onChange={(arrivalDate) => onChange({ arrivalDate })}
                min={todayIso()}
                placeholder={e("arrivalPh")}
                monthJump
                ariaLabel={e("arrival")}
              />
            </FollowUp>
          </Under>
          {/* already in Indonesia: the day they arrived, so up to today */}
          <Under open={inIndonesia}>
            <FollowUp
              id="q2-arrived"
              title={e("arrival")}
              hint={e("arrivedHint")}
              missing={miss(inIndonesia && !value.arrivalDate, "chooseDate")}
            >
              <DatePicker
                value={value.arrivalDate}
                onChange={(arrivalDate) => onChange({ arrivalDate })}
                max={todayIso()}
                placeholder={e("arrivalPh")}
                monthJump
                ariaLabel={e("arrival")}
              />
            </FollowUp>
          </Under>
        </div>
      </Question>

      <Question n={3} id="q3" title={e("q3")} done={answered.q3}>
        <div>
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
          <Under open={visa}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <FollowUp
                id="q3-vitas"
                title={e("vitas")}
                hint={e("vitasHint")}
                missing={miss(visa && value.hasVitas === undefined, "chooseOne")}
              >
                <RadioCards labelledBy="q3-vitas" value={value.hasVitas} onChange={(hasVitas) => onChange({ hasVitas })} options={yesNo} />
              </FollowUp>
              <FollowUp
                id="q3-itas"
                title={e("itas")}
                hint={e("itasHint")}
                missing={miss(visa && value.hasItas === undefined, "chooseOne")}
              >
                <RadioCards labelledBy="q3-itas" value={value.hasItas} onChange={(hasItas) => onChange({ hasItas })} options={yesNo} />
              </FollowUp>
            </div>
          </Under>
        </div>
      </Question>

      <Question n={4} id="q4" title={e("q4")} sub={e("q4Sub")} done={answered.q4}>
        <div>
          <Asked missing={miss(!value.reason, "chooseOne")}>
            <RadioCards
              labelledBy="q4"
              columns={3}
              value={value.reason}
              onChange={(reason) => onChange({ reason, ...(reason === "others" ? {} : { reasonOther: "" }) })}
              options={REASONS.map((r) => ({ value: r, label: e(`reasons.${r}`) }))}
            />
          </Asked>
          <Under open={otherReason}>
            <Field label={e("reasonOther")} hint={reasonOtherErr ? undefined : e("otherRequired")} error={reasonOtherErr}>
              <Well
                value={value.reasonOther}
                onChange={(ev) => onChange({ reasonOther: ev.target.value })}
                placeholder={e("reasonOtherPh")}
                maxLength={120}
              />
            </Field>
          </Under>
        </div>
      </Question>
    </div>
  );
}
