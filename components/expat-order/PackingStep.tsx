"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronUp, Info, Plus, Ruler, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Field } from "@/components/shared/forms/Field";
import { PACKAGING_TYPES } from "@/components/order/module-options";
import { CURRENCIES } from "@/lib/data/currencies";
import {
  declaredValue,
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
  !!(pk.weight || pk.length || pk.width || pk.height || pk.packagingOther?.trim() || pk.items.some((it) => it.name.trim() || it.value));
/** after the click's render has landed */
const onceRendered = (run: () => void) => window.requestAnimationFrame(run);

/** a size or weight past these is far likelier a slip of a unit (millimetres,
 *  grams) than a package: it's asked about, never refused. Stand-ins for ops
 *  to set (ORDER_REVIEW_NOTES.packing) */
const ODD_SIDE_CM = 300;
const ODD_WEIGHT_KG = 500;

/**
 * The Packages step, the WNI flow's Items & Packages in the plan's dress: the
 * values' currency first, then each package a Panel 2 block (packaging,
 * weight and three sides, what's inside), then the totals. The estimate
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
    <div className="space-y-6">
      <p className="flex gap-2 text-sm text-muted">
        <Ruler aria-hidden className="mt-0.5 size-4 shrink-0" />
        {p("guess")}
      </p>

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

      <div className="space-y-3">
        {many && (
          <div className="flex justify-end">
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
        <ol className="space-y-3">
          {value.packages.map((pk, i) => (
            <li key={pk.id}>
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
        <Button ref={addRef} type="button" variant="dashed" className="w-full" onClick={addPackage}>
          <Plus /> {p("addPackage")}
        </Button>
      </div>

      <div className="border-t border-border pt-6">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted">{p("totalPackages")}</dt>
            <dd className="mt-0.5 font-display text-xl font-bold tracking-tight tabular-nums">{totals.packages}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{p("totalKg")}</dt>
            <dd className="mt-0.5 font-display text-xl font-bold tracking-tight tabular-nums">{kg(totals.kg)} kg</dd>
            {pricing.packed && pricing.kg !== checkedKg && (
              <dd className="mt-0.5 text-xs text-muted">{p("checkedKg").replace("{kg}", kg(checkedKg))}</dd>
            )}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-xs text-muted">{p("totalValue")}</dt>
            <dd className="mt-0.5 font-display text-xl font-bold tracking-tight tabular-nums">
              {declaredValue(totals.value, currency)}
            </dd>
          </div>
        </dl>
        {pricing.specialFromKg ? (
          <p role="status" className={cn("mt-5 flex gap-2 rounded-md bg-info/10 px-3 py-2.5 text-sm", edited && "banner-enter")}>
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-info" />
            {/* the weight the standing estimate is priced on: the one
                checked, unless the Special Rate was picked on the plan */}
            {p("estimateNoSpecial").replace("{min}", kg(pricing.specialFromKg)).replace("{kg}", kg(pricing.rate.chargedKg))}
          </p>
        ) : (
          <p className="mt-5 text-xs leading-relaxed text-muted">
            {pricing.packed ? p("estimatePacked") : p("estimatePending")}
          </p>
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
  return (
    <div className="relative">
      <Input {...props} inputMode="decimal" className="pr-10 tabular-nums" />
      <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-2">
        {unit}
      </span>
    </div>
  );
}

/** one package: a Panel 2 block whose head opens and closes it, and names it
 *  in a line while it's closed */
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

  const other = pkg.packaging === "other";
  const count = pkg.items.reduce((s, it) => s + (Number.parseFloat(it.quantity) || 0), 0);
  const done = complete(pkg);
  const touched = !!(pkg.weight || pkg.length || pkg.width || pkg.height || pkg.items.some((it) => it.name.trim()));
  const summary = done
    ? [
        other ? pkg.packagingOther!.trim() : p(`types.${pkg.packaging}`),
        `${kg(Number.parseFloat(pkg.weight))} kg`,
        `${pkg.length} × ${pkg.width} × ${pkg.height} cm`,
        count === 1 ? p("itemsOne") : p("itemsMany").replace("{n}", String(count)),
      ].join(" · ")
    : touched
      ? p("unfinished")
      : p("empty");
  const charge = packageMeasured(pkg) ? packageCharge(pkg) : null;
  const longest = Math.max(...(["length", "width", "height"] as const).map((s) => Number.parseFloat(pkg[s]) || 0));
  const heavy = (Number.parseFloat(pkg.weight) || 0) > ODD_WEIGHT_KG;

  const setItem = (id: string, patch: Partial<PackingItem>) =>
    onChange({ items: pkg.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });

  return (
    <div className="rounded-md bg-surface-2 px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={regionId}
          // the press is answered at once, in colour, over the whole line (and let go of over 150ms)
          className="relative -my-3 flex min-w-0 flex-1 items-center gap-2 rounded-sm py-3 text-left after:-inset-x-2 after:inset-y-1 after:absolute after:rounded-sm after:transition-colors active:after:bg-foreground/[0.04] active:after:duration-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        >
          {/* swap, never rotate: the shared disclosure idiom */}
          {open ? (
            <ChevronUp aria-hidden className="size-4 shrink-0 text-muted-2" />
          ) : (
            <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-2" />
          )}
          <span className="shrink-0 font-display text-sm font-semibold">{p("packageN").replace("{n}", String(n))}</span>
          {/* nothing left to ask of it: the plan's done mark, small */}
          {done && (
            <span className="grid size-4 shrink-0 place-items-center rounded-full bg-brand text-brand-ink">
              <Check aria-hidden className="size-2.5" strokeWidth={3.5} />
              <span className="sr-only">{t("expatOrder.plan.done")}</span>
            </span>
          )}
          {!open && <span className="truncate text-sm text-muted">{summary}</span>}
        </button>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            aria-label={p("removePackage").replace("{n}", String(n))}
            className="tap-target relative -my-2 shrink-0 text-muted hover:bg-surface-3 hover:text-danger"
          >
            <Trash2 /> {p("remove")}
          </Button>
        )}
      </div>

      <CollapseHeight open={open} id={regionId}>
        <div className="space-y-6 pt-5">
          {/* Others asks what it's packed in, beside the choice from sm, as
              Moving from sits beside Moving to */}
          <div className="grid items-start gap-3 sm:grid-cols-2">
            <Field label={p("packaging")} hint={pkg.packaging !== "box" ? p("surcharge") : undefined}>
              <SelectField
                value={pkg.packaging}
                onChange={(packaging) => onChange({ packaging, ...(packaging === "other" ? {} : { packagingOther: "" }) })}
                ariaLabel={p("packaging")}
                options={PACKAGING_TYPES.map((o) => ({ value: o.value, label: p(`types.${o.value}`) }))}
              />
            </Field>
            {other && (
              <Field
                label={p("packagingOther")}
                hint={p("packagingOtherHint")}
                error={seen(`${pkg.id}.packagingOther`) && !packagingDescribed(pkg) ? p("required") : undefined}
              >
                <Input
                  value={pkg.packagingOther ?? ""}
                  onChange={(e) => onChange({ packagingOther: e.target.value })}
                  onBlur={leave(`${pkg.id}.packagingOther`)}
                  placeholder={p("packagingOtherPh")}
                  maxLength={60}
                />
              </Field>
            )}
          </div>

          <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {measure("weight")}
              {measure("length")}
              {measure("width")}
              {measure("height")}
            </div>
            {charge && (
              <p className="mt-2 text-xs text-muted">
                {p(charge.by === "size" ? "chargeSize" : "chargeWeight").replace("{kg}", kg(charge.kg))}
              </p>
            )}
            {/* a number that looks like the wrong unit: asked about, not
                refused, since the estimate follows it at once */}
            {(longest > ODD_SIDE_CM || heavy) && (
              <p role="status" className={cn("mt-3 flex gap-2 rounded-md bg-info/10 px-3 py-2.5 text-sm", enter && "banner-enter")}>
                <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-info" />
                <span>
                  {longest > ODD_SIDE_CM &&
                    p("oddSize").replace("{cm}", kg(longest)).replace("{m}", kg(longest / 100))}
                  {longest > ODD_SIDE_CM && heavy && " "}
                  {heavy && p("oddWeight").replace("{kg}", kg(Number.parseFloat(pkg.weight)))}
                </span>
              </p>
            )}
          </div>

          <fieldset>
            <legend className="text-sm font-medium">{p("inside")}</legend>
            <ul className="mt-1 divide-y divide-border">
              {pkg.items.map((it, j) => {
                const nameErr = seen(`${it.id}.name`) && !it.name.trim() ? p("required") : undefined;
                const qtyErr = seen(`${it.id}.qty`) && !(Number.parseFloat(it.quantity) >= 1) ? p("required") : undefined;
                return (
                  <li
                    key={it.id}
                    data-item={it.id}
                    className="grid grid-cols-[4.5rem_minmax(0,1fr)_2.75rem] items-start gap-x-3 gap-y-3 py-3 sm:grid-cols-[minmax(0,1fr)_4.5rem_9rem_2.75rem]"
                  >
                    <div className="col-span-3 sm:col-span-1">
                      <Field label={p("itemName")} error={nameErr}>
                        <Input
                          value={it.name}
                          onChange={(e) => setItem(it.id, { name: e.target.value })}
                          onBlur={leave(`${it.id}.name`)}
                          placeholder={p("itemNamePh")}
                          maxLength={120}
                        />
                      </Field>
                    </div>
                    <Field label={p("qty")} error={qtyErr}>
                      <Input
                        value={it.quantity}
                        onChange={(e) => setItem(it.id, { quantity: digits(e.target.value) })}
                        onBlur={leave(`${it.id}.qty`)}
                        inputMode="numeric"
                        className="tabular-nums"
                        maxLength={5}
                      />
                    </Field>
                    <Field label={p("value")}>
                      <PrefixedInput
                        prefix={currency}
                        value={it.value}
                        onChange={(e) => setItem(it.id, { value: decimal(e.target.value) })}
                        inputMode="decimal"
                        placeholder="0"
                        maxLength={12}
                      />
                    </Field>
                    {/* the label's height (16px line, 6px gap), so the button
                        lines up with the inputs */}
                    <div className="pt-[1.375rem]">
                      {pkg.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onChange({ items: pkg.items.filter((x) => x.id !== it.id) })}
                          aria-label={p("removeItem").replace("{n}", String(j + 1))}
                          className="size-11 text-muted hover:bg-surface-3 hover:text-danger"
                        >
                          <X />
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => {
                const it = newPackingItem();
                onChange({ items: [...pkg.items, it] });
                // the new row's name is what's typed next
                onceRendered(() => document.querySelector<HTMLElement>(`[data-item="${it.id}"] input`)?.focus());
              }}
              className="link-mark tap-row relative mt-1 inline-flex items-center gap-1.5 text-sm"
            >
              <Plus aria-hidden className="size-4" /> {p("addItem")}
            </button>
          </fieldset>
        </div>
      </CollapseHeight>
    </div>
  );
}

/** an Input with the currency worn quietly on the left; Field's wiring lands
 *  on the input */
function PrefixedInput({ prefix, className, ...props }: { prefix: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-2">
        {prefix}
      </span>
      <Input {...props} className={cn("pl-12 tabular-nums", className)} />
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
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {p("removeCancel")}
          </Button>
          <Button
            type="button"
            variant="danger"
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
