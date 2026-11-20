"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, PackageSearch, Ruler } from "lucide-react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { CollapseHeight } from "@/components/ui/disclosure";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PACKAGING_TYPES } from "@/components/order/module-options";
import { CURRENCIES } from "@/lib/data/currencies";
import {
  BOX_CHOICES,
  BOX_SIZES,
  CONTENT_CATEGORIES,
  declaredValue,
  isStandardBox,
  itemDescribed,
  newPackingItem,
  newPackingPackage,
  packageCharge,
  packageMeasured,
  packagingDescribed,
  packingCurrency,
  packingTotals,
  type PackingInput,
  type PackingItem,
  type PackedPricing,
  type PackingPackage,
} from "@/lib/order/expat-order";
import { formatNumber } from "@/lib/utils/currency";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { RadioCards } from "./ChoiceCards";
import { ACTION, Done, Field, InspectLink, Note, PRESS, QUIET, REMOVE, REMOVE_CONFIRM, TYPE, Well, Worn, Wrong } from "./kit";

/** digits and one decimal point, a comma read as one */
function decimal(s: string): string {
  const [whole, ...rest] = s.replace(/,/g, ".").replace(/[^0-9.]/g, "").split(".");
  return rest.length ? `${whole}.${rest.join("")}` : whole;
}
const digits = (s: string) => s.replace(/[^0-9]/g, "");
const kg = (n: number) => formatNumber(n, 1, "en");

/** past this many packages, the finished ones open folded */
const FOLD_FROM = 3;

/** nothing left to ask of it */
const complete = (pk: PackingPackage) => packageMeasured(pk) && packagingDescribed(pk) && pk.items.every(itemDescribed);
/** something typed that removing it would take along */
const hasContent = (pk: PackingPackage) =>
  !!(
    pk.box ||
    pk.weight ||
    pk.length ||
    pk.width ||
    pk.height ||
    pk.packagingOther?.trim() ||
    pk.items.some((it) => it.category || it.name.trim() || it.value)
  );
/** after the click's render has landed */
const onceRendered = (run: () => void) => window.requestAnimationFrame(run);

/** a size or weight past these is far likelier a slip of a unit (millimetres,
 *  grams) than a package: it's asked about, never refused. Stand-ins for ops
 *  to set (ORDER_REVIEW_NOTES.packing) */
const ODD_SIDE_CM = 300;
const ODD_WEIGHT_KG = 500;

/**
 * The Packages step ("Estimate your shipment"), the WNI flow's Items & Packages
 * in the plan's dress: the values' currency first, then the packages as a
 * ruled list on the part's own paper (each the standard box it's closest
 * to, or Custom with its packaging and three sides, then its estimated
 * weight; then what's inside, a row per kind of thing), then the totals. The estimate
 * lives in the Selected Service beside it and follows the packages once
 * they're measured (packedPricing); this step says so under the totals.
 * Errors show once a field is left, as on Your details; `tried` (a count of
 * the plan's action pressed while a package was still open) shows them all
 * and unfolds the packages it waits on. A package with something typed in
 * it asks before it's removed.
 */
export function PackingStep({
  value,
  onChange,
  originCountry,
  checkedKg,
  pricing,
  tried = 0,
}: {
  value: PackingInput;
  onChange: (next: PackingInput) => void;
  originCountry: string;
  /** the weight checked at Check Rate, as it's priced (rounded up) */
  checkedKg: number;
  pricing: PackedPricing;
  tried?: number;
}) {
  const t = useT();
  const p = (k: string) => t(`expatOrder.packing.${k}`);
  const [left, setLeft] = React.useState<Record<string, boolean>>({});
  const leave = (k: string) => () => setLeft((s) => ({ ...s, [k]: true }));
  // a short list opens whole. A long one (a house, package by package) would
  // run to dozens of screens, so its finished packages start folded and the
  // ones still to fill stay open
  const [collapsed, setCollapsed] = React.useState<Set<string>>(
    () =>
      new Set(
        value.packages.length > FOLD_FROM
          ? value.packages.filter(complete).map((pk) => pk.id)
          : [],
      ),
  );
  // the action was pressed again: a folded package can't say what it's
  // missing, so the ones it waits on unfold
  const [seenTried, setSeenTried] = React.useState(tried);
  if (seenTried !== tried) {
    setSeenTried(tried);
    setCollapsed((s) => new Set([...s].filter((id) => value.packages.some((pk) => pk.id === id && complete(pk)))));
  }
  // a notice that comes of an edit eases in; one a draft arrived with stands
  const [edited, setEdited] = React.useState(false);
  // the package asked about before it goes, and its number while the dialog closes
  const [removing, setRemoving] = React.useState<string | null>(null);
  const [removingN, setRemovingN] = React.useState(1);
  const addRef = React.useRef<HTMLButtonElement>(null);

  const currency = packingCurrency(value, originCountry);
  const totals = packingTotals(value);
  const many = value.packages.length > 1;
  const anyOpen = value.packages.some((pk) => !collapsed.has(pk.id));

  const setPackage = (id: string, patch: Partial<PackingPackage>) => {
    setEdited(true);
    onChange({ ...value, packages: value.packages.map((pk) => (pk.id === id ? { ...pk, ...patch } : pk)) });
  };
  const remove = (id: string) => onChange({ ...value, packages: value.packages.filter((x) => x.id !== id) });
  const addPackage = () => {
    const pk = newPackingPackage();
    onChange({ ...value, packages: [...value.packages, pk] });
    // the new one comes into view with its first control in hand, so it's
    // seen to have been added however long the list above it
    onceRendered(() => {
      const region = document.getElementById(`package-${pk.id}`);
      region?.querySelector<HTMLElement>("button, input")?.focus({ preventScroll: true });
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      region?.closest("li")?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" });
    });
  };
  const toggle = (id: string) =>
    setCollapsed((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="grid grid-cols-1 gap-6">
      <p className="flex gap-2 text-sm text-muted">
        <span className="flex h-5 shrink-0 items-center">
          <Ruler aria-hidden className="size-4" />
        </span>
        {p("guess")}
      </p>

      {/* that any package can be opened, told once, where what's in them is
          listed: the list is what an inspection checks, so the worry comes
          with the one thing to do about it. Told, as the plan's other
          notes are, in the quiet note, never the colour of a warning */}
      <Note icon={PackageSearch} title={p("inspectTitle")}>
        <p className="mt-1 text-muted">
          {p("inspectBody")} <InspectLink />
        </p>
      </Note>

      {/* before the packages: every value typed in them wears it */}
      <Field label={p("currency")}>
        <SelectField
          value={currency}
          onChange={(c) => onChange({ ...value, currency: c })}
          ariaLabel={p("currency")}
          wrapperClassName="sm:max-w-xs"
          searchable
          searchPlaceholder={p("currencySearch")}
          emptyText={p("currencyEmpty")}
          options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} – ${c.name}` }))}
        />
      </Field>

      <div>
        {many && (
          <div className="mb-2 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="tap-target relative"
              onClick={() => setCollapsed(anyOpen ? new Set(value.packages.map((pk) => pk.id)) : new Set())}
            >
              {anyOpen ? <ChevronUp /> : <ChevronDown />}
              {anyOpen ? p("collapseAll") : p("expandAll")}
            </Button>
          </div>
        )}
        {/* a record that repeats is ruled, not boxed: one package, a hairline, the next */}
        <ol className="divide-y divide-border border-y border-border">
          {value.packages.map((pk, i) => (
            <li key={pk.id} className="py-4">
              <PackageBlock
                n={i + 1}
                pkg={pk}
                currency={currency}
                open={!collapsed.has(pk.id)}
                onToggle={() => toggle(pk.id)}
                onChange={(patch) => setPackage(pk.id, patch)}
                onRemove={
                  many
                    ? () => {
                        // an empty one just goes; one with something in it asks first
                        if (!hasContent(pk)) return remove(pk.id);
                        setRemovingN(i + 1);
                        setRemoving(pk.id);
                      }
                    : undefined
                }
                left={left}
                leave={leave}
                tried={tried > 0}
                enter={edited}
              />
            </li>
          ))}
        </ol>
        <Button ref={addRef} type="button" variant="secondary" className={cn(ACTION, "mt-4 w-full")} onClick={addPackage}>
          <PlusIcon /> {p("addPackage")}
        </Button>
      </div>

      <div>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted">{p("totalPackages")}</dt>
            <dd className={cn(TYPE.subhead, "mt-1 tabular-nums")}>{totals.packages}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{p("totalKg")}</dt>
            <dd className={cn(TYPE.subhead, "mt-1 tabular-nums")}>{kg(totals.kg)} kg</dd>
            {pricing.packed && pricing.kg !== checkedKg && (
              <dd className="mt-1 text-xs text-muted">{p("checkedKg").replace("{kg}", kg(checkedKg))}</dd>
            )}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-xs text-muted">{p("totalValue")}</dt>
            <dd className={cn(TYPE.subhead, "mt-1 tabular-nums")}>{declaredValue(totals.value, currency)}</dd>
          </div>
        </dl>
        {pricing.specialFromKg ? (
          <Note className={cn("mt-4", edited && "banner-enter")}>
            {/* the weight the standing estimate is priced on: the one
                checked, unless the Special Rate was picked on the plan */}
            {p("estimateNoSpecial").replace("{min}", kg(pricing.specialFromKg)).replace("{kg}", kg(pricing.rate.chargedKg))}
          </Note>
        ) : (
          // once the packages are measured, the estimate follows them; before
          // that, nothing to say
          pricing.packed && <p className="mt-4 text-xs text-muted">{p("estimatePacked")}</p>
        )}
      </div>

      <RemovePackageDialog
        n={removingN}
        open={removing !== null}
        onOpenChange={(o) => !o && setRemoving(null)}
        onConfirm={() => {
          if (removing) remove(removing);
          setRemoving(null);
        }}
        // its Remove button went with the package: focus lands on the way to add one
        focusAfter={addRef}
      />
    </div>
  );
}

/** a number field with its unit worn inside, on the right */
function UnitInput({ unit, ...props }: { unit: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <Well {...props} inputMode="decimal" className="tabular-nums" after={<Worn>{unit}</Worn>} />;
}

/** one package, on the part's own paper: its head opens and closes it, and
 *  names it in a line while it's closed */
function PackageBlock({
  n,
  pkg,
  currency,
  open,
  onToggle,
  onChange,
  onRemove,
  left,
  leave,
  tried,
  enter,
}: {
  n: number;
  pkg: PackingPackage;
  currency: string;
  open: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<PackingPackage>) => void;
  onRemove?: () => void;
  left: Record<string, boolean>;
  leave: (k: string) => () => void;
  /** the plan's action was pressed: every error shows, left or not */
  tried: boolean;
  /** notices ease in (they come of an edit, not of a draft) */
  enter: boolean;
}) {
  const t = useT();
  const p = (k: string) => t(`expatOrder.packing.${k}`);
  const regionId = `package-${pkg.id}`;
  const seen = (k: string) => left[k] || tried;

  const measure = (side: "weight" | "length" | "width" | "height") => {
    const k = `${pkg.id}.${side}`;
    const v = Number.parseFloat(pkg[side]);
    const error = seen(k) && !(v > 0) ? (pkg[side] ? p("aboveZero") : p("required")) : undefined;
    return (
      <Field label={p(side)} error={error}>
        <UnitInput
          unit={side === "weight" ? "kg" : "cm"}
          value={pkg[side]}
          onChange={(e) => onChange({ [side]: decimal(e.target.value) })}
          onBlur={leave(k)}
          placeholder="0"
          maxLength={7}
        />
      </Field>
    );
  };

  const std = isStandardBox(pkg.box);
  const isOther = pkg.box === "other";
  const packedOther = pkg.packaging === "other";
  const count = pkg.items.reduce((s, it) => s + (Number.parseFloat(it.quantity) || 0), 0);
  const done = complete(pkg);
  const touched = !!(
    pkg.box ||
    pkg.weight ||
    pkg.length ||
    pkg.width ||
    pkg.height ||
    pkg.items.some((it) => it.category || it.name.trim())
  );
  const sides = (d: { length: number | string; width: number | string; height: number | string }) =>
    `${d.length} × ${d.width} × ${d.height} cm`;
  // a tile's line: one size, never broken across lines
  const nb = (x: string) => x.replace(/ /g, "\u00a0");
  const summary = done
    ? [
        std ? p(`boxes.${pkg.box}`) : packedOther ? pkg.packagingOther!.trim() : p(`types.${pkg.packaging}`),
        `${kg(Number.parseFloat(pkg.weight))} kg`,
        sides(std ? BOX_SIZES[pkg.box as keyof typeof BOX_SIZES] : pkg),
        count === 1 ? p("itemsOne") : p("itemsMany").replace("{n}", String(count)),
      ].join(" · ")
    : touched
      ? p("unfinished")
      : p("empty");
  const charge = packageMeasured(pkg) ? packageCharge(pkg) : null;
  // a Custom package's own sides only: a standard box's are known
  const longest = isOther
    ? Math.max(...(["length", "width", "height"] as const).map((s) => Number.parseFloat(pkg[s]) || 0))
    : 0;
  const heavy = (Number.parseFloat(pkg.weight) || 0) > ODD_WEIGHT_KG;
  const boxId = `${regionId}-box`;
  const boxErr = tried && !pkg.box ? p("boxPick") : undefined;

  const setItem = (id: string, patch: Partial<PackingItem>) =>
    onChange({ items: pkg.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={regionId}
          className={cn(PRESS, "flex min-w-0 flex-1 items-center gap-2 rounded-sm py-1 text-left")}
        >
          {/* swap, never rotate: the shared disclosure idiom */}
          {open ? (
            <ChevronUp aria-hidden className="size-4 shrink-0 text-muted" />
          ) : (
            <ChevronDown aria-hidden className="size-4 shrink-0 text-muted" />
          )}
          <span className={cn(TYPE.subhead, "shrink-0")}>{p("packageN").replace("{n}", String(n))}</span>
          {/* nothing left to ask of it */}
          {done && <Done label={t("expatOrder.plan.done")} />}
          {!open && <span className="truncate text-sm text-muted">{summary}</span>}
        </button>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            aria-label={p("removePackage").replace("{n}", String(n))}
            className={cn(REMOVE, "tap-target relative shrink-0")}
          >
            {/* the bin in outline, drawn at 2 so it holds its weight at 16px
                (the team's call, 2026-11-20), as "Need help?"'s bubble is */}
            <TrashIcon strokeWidth={2} /> {p("remove")}
          </Button>
        )}
      </div>

      {/* a little room around the fold, which clips what's past its edge,
          so a field's focus ring isn't cut */}
      <div className="-mx-1">
        <CollapseHeight open={open} id={regionId} className="px-1 pb-1">
          <div className="grid grid-cols-1 gap-6 pt-4">
            {/* the box it's closest to: a size, not a box we send, picked
                by its sides. Custom (anything else: a suitcase, a crate, a
                bigger box) is asked what it's in and its sides. Once a size
                is picked, every package is asked its estimated weight, and
                is charged on that or its volumetric weight, whichever is more */}
            <div>
              <p id={boxId} className="mb-1 text-xs font-medium">
                {p("box")}
              </p>
              <RadioCards
                tiles
                labelledBy={boxId}
                describedBy={boxErr ? `${boxId}-error` : `${boxId}-hint`}
                value={pkg.box || undefined}
                onChange={(box) => onChange({ box })}
                options={BOX_CHOICES.map((b) =>
                  isStandardBox(b)
                    ? { value: b, label: p(`boxes.${b}`), sub: nb(sides(BOX_SIZES[b])) }
                    : { value: b, label: p("boxes.other"), sub: p("boxOtherSub") },
                )}
              />
              {boxErr ? (
                <Wrong id={`${boxId}-error`}>{boxErr}</Wrong>
              ) : (
                <p id={`${boxId}-hint`} className="mt-1 text-xs text-muted">
                  {p("boxHint")}
                </p>
              )}

              <div className="-mx-1">
                <CollapseHeight open={isOther} className="px-1 pb-1">
                  <div className="grid grid-cols-1 gap-6 pt-6">
                    {/* Others asks what it's packed in, beside the choice from sm, as
                        Moving from sits beside Moving to */}
                    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 sm:gap-6">
                      <Field label={p("packaging")} hint={pkg.packaging !== "box" ? p("surcharge") : undefined}>
                        <SelectField
                          value={pkg.packaging}
                          onChange={(packaging) =>
                            onChange({ packaging, ...(packaging === "other" ? {} : { packagingOther: "" }) })
                          }
                          ariaLabel={p("packaging")}
                          options={PACKAGING_TYPES.map((o) => ({ value: o.value, label: p(`types.${o.value}`) }))}
                        />
                      </Field>
                      {packedOther && (
                        <Field
                          label={p("packagingOther")}
                          hint={p("packagingOtherHint")}
                          error={seen(`${pkg.id}.packagingOther`) && !packagingDescribed(pkg) ? p("required") : undefined}
                        >
                          <Well
                            value={pkg.packagingOther ?? ""}
                            onChange={(e) => onChange({ packagingOther: e.target.value })}
                            onBlur={leave(`${pkg.id}.packagingOther`)}
                            placeholder={p("packagingOtherPh")}
                            maxLength={60}
                          />
                        </Field>
                      )}
                    </div>
                    {/* how to measure, said once for all three: a suitcase's
                        wheels and handles count, as the carrier counts them */}
                    <div>
                      <div className="grid grid-cols-3 gap-3">
                        {measure("length")}
                        {measure("width")}
                        {measure("height")}
                      </div>
                      <p className="mt-1 text-xs text-muted">{p("sidesHint")}</p>
                    </div>
                  </div>
                </CollapseHeight>
              </div>

              {/* the weight, once there's a size to weigh: a third of the row
                  from sm, as a side is, half on a phone */}
              <div className="-mx-1">
                <CollapseHeight open={!!pkg.box} className="px-1 pb-1">
                  <div className="pt-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{measure("weight")}</div>
                    {charge && (
                      <p className="mt-1 text-xs text-muted">
                        {p(charge.by === "size" ? "chargeSize" : "chargeWeight").replace("{kg}", kg(charge.kg))}
                      </p>
                    )}
                    {/* a number that looks like the wrong unit: asked about, not
                        refused, since the estimate follows it at once */}
                    {(longest > ODD_SIDE_CM || heavy) && (
                      <Note className={cn("mt-3", enter && "banner-enter")}>
                        {longest > ODD_SIDE_CM && p("oddSize").replace("{cm}", kg(longest)).replace("{m}", kg(longest / 100))}
                        {longest > ODD_SIDE_CM && heavy && " "}
                        {heavy && p("oddWeight").replace("{kg}", kg(Number.parseFloat(pkg.weight)))}
                      </Note>
                    )}
                  </div>
                </CollapseHeight>
              </div>
            </div>

            <fieldset>
              <legend className="text-sm font-medium">{p("inside")}</legend>
              {/* the row's shape, which no label says: one per kind of thing,
                  its value for all of them */}
              <p className="mt-1 text-xs text-muted">{p("insideHint")}</p>
              {/* a row per kind of thing (its category, how many, what they're
                  worth together), each field wearing what it is ("Qty", the
                  currency and "total"), so no label is repeated down the
                  list: a phone sets the category over the other two. A kind
                  already listed isn't offered again in the same package;
                  Others is, as often as needed, and asks what it is */}
              <ul className="mt-2 grid grid-cols-1 gap-4 sm:gap-2">
                {pkg.items.map((it, j) => {
                  const catErr = tried && !it.category ? p("required") : undefined;
                  const nameErr =
                    it.category === "others" && seen(`${it.id}.name`) && !it.name.trim() ? p("required") : undefined;
                  const qtyErr = seen(`${it.id}.qty`) && !(Number.parseFloat(it.quantity) >= 1) ? p("required") : undefined;
                  const used = new Set(
                    pkg.items.filter((x) => x.id !== it.id && x.category !== "others").map((x) => x.category),
                  );
                  return (
                    <li
                      key={it.id}
                      data-item={it.id}
                      className="grid grid-cols-[6rem_minmax(0,1fr)_2.75rem] items-start gap-2 sm:grid-cols-[minmax(0,1fr)_6rem_11rem_2.75rem]"
                    >
                      <div className="col-span-3 sm:col-span-1">
                        <Field quiet label={`${p("category")} ${j + 1}`} error={catErr}>
                          <SelectField
                            value={it.category}
                            onChange={(category) => setItem(it.id, { category })}
                            ariaLabel={`${p("category")} ${j + 1}`}
                            placeholder={p("categoryPh")}
                            searchable
                            searchPlaceholder={p("categorySearch")}
                            emptyText={p("categoryEmpty")}
                            options={CONTENT_CATEGORIES.filter((c) => !used.has(c)).map((c) => ({
                              value: c,
                              label: p(`contents.${c}`),
                              hint: p(`contentsEx.${c}`),
                              sticky: c === "others",
                            }))}
                          />
                        </Field>
                      </div>
                      <Field quiet label={`${p("category")} ${j + 1}: ${p("qty")}`} error={qtyErr}>
                        <Well
                          value={it.quantity}
                          onChange={(e) => setItem(it.id, { quantity: digits(e.target.value) })}
                          onBlur={leave(`${it.id}.qty`)}
                          inputMode="numeric"
                          className="tabular-nums"
                          maxLength={5}
                          before={<Worn>{p("qty")}</Worn>}
                        />
                      </Field>
                      <Field quiet label={`${p("category")} ${j + 1}: ${p("value")}`}>
                        <Well
                          value={it.value}
                          onChange={(e) => setItem(it.id, { value: decimal(e.target.value) })}
                          inputMode="decimal"
                          className="tabular-nums"
                          placeholder="0"
                          maxLength={12}
                          before={<Worn>{currency}</Worn>}
                          after={<Worn>{p("total")}</Worn>}
                        />
                      </Field>
                      {pkg.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onChange({ items: pkg.items.filter((x) => x.id !== it.id) })}
                          aria-label={p("removeItem").replace(
                            "{name}",
                            it.category === "others"
                              ? it.name.trim() || p("thisRow")
                              : it.category
                                ? p(`contents.${it.category}`)
                                : p("thisRow"),
                          )}
                          className={cn(REMOVE, "size-11")}
                        >
                          <XMarkIcon />
                        </Button>
                      )}
                      {/* Others: what it is, under its row */}
                      {it.category === "others" && (
                        <div className="col-span-3">
                          <Field quiet label={`${p("category")} ${j + 1}: ${p("otherWhat")}`} error={nameErr}>
                            <Well
                              value={it.name}
                              onChange={(e) => setItem(it.id, { name: e.target.value })}
                              onBlur={leave(`${it.id}.name`)}
                              placeholder={p("otherWhatPh")}
                              maxLength={120}
                            />
                          </Field>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              {/* a button, not a link: it adds a row here */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const it = newPackingItem();
                  onChange({ items: [...pkg.items, it] });
                  // the new row's category is what's picked next
                  onceRendered(() => document.querySelector<HTMLElement>(`[data-item="${it.id}"] button`)?.focus());
                }}
                className={cn(ACTION, "tap-target relative mt-3")}
              >
                <PlusIcon /> {p("addItem")}
              </Button>
            </fieldset>
          </div>
        </CollapseHeight>
      </div>
    </div>
  );
}

/** Removing a package that has something typed in it takes that along, and
 *  nothing brings it back: asked first, as the app asks before every delete.
 *  Once it's gone its own Remove button is too, so focus goes to `focusAfter`. */
function RemovePackageDialog({
  n,
  open,
  onOpenChange,
  onConfirm,
  focusAfter,
}: {
  n: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  focusAfter: React.RefObject<HTMLButtonElement | null>;
}) {
  const t = useT();
  const p = (k: string) => t(`expatOrder.packing.${k}`);
  const removed = React.useRef(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        onCloseAutoFocus={(e) => {
          if (!removed.current) return;
          removed.current = false;
          e.preventDefault();
          focusAfter.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{p("removeTitle").replace("{n}", String(n))}</DialogTitle>
          <DialogDescription>{p("removeBody")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="secondary" className={QUIET} onClick={() => onOpenChange(false)}>
            {p("removeCancel")}
          </Button>
          {/* the dialog's one solid button, in the red of what it does (it
              takes the package away, as the Remove that opened it says);
              lime is for going on, not for taking away */}
          <Button
            type="button"
            variant="danger"
            className={REMOVE_CONFIRM}
            onClick={() => {
              removed.current = true;
              onConfirm();
            }}
          >
            {p("removeConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
