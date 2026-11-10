"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Info, Plus, Ruler, Trash2, X } from "lucide-react";
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
import { FileUpload } from "@/components/order/FileUpload";
import { PACKAGING_TYPES } from "@/components/order/module-options";
import { CURRENCIES } from "@/lib/data/currencies";
import {
  PHOTO_SIDES,
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

export interface PackingStepHandle {
  /** open a package and bring its photos into view */
  reveal: (id: string) => void;
}

/**
 * The Packages step, the WNI flow's Items & Packages in the plan's dress: each
 * package a Panel 2 block (packaging, weight and three sides, what's inside,
 * the measurement photos), then the values' currency and the totals. The
 * estimate lives in the Selected Service beside it and follows the packages
 * once they're measured (packedPricing); this step says so under the totals.
 * Errors show once a field is left, as on Your details.
 */
export function PackingStep({
  value,
  onChange,
  originCountry,
  checkedKg,
  pricing,
  handleRef,
}: {
  value: PackingInput;
  onChange: (next: PackingInput) => void;
  originCountry: string;
  /** the weight the Selected Rate was priced on at Check Rate */
  checkedKg: number;
  pricing: PackedPricing;
  handleRef?: React.Ref<PackingStepHandle>;
}) {
  const t = useT();
  const p = (k: string) => t(`expatOrder.packing.${k}`);
  const [left, setLeft] = React.useState<Record<string, boolean>>({});
  const leave = (k: string) => () => setLeft((s) => ({ ...s, [k]: true }));
  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set());
  const photoRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const currency = packingCurrency(value, originCountry);
  const totals = packingTotals(value);
  const many = value.packages.length > 1;
  const anyOpen = value.packages.some((pk) => !collapsed.has(pk.id));

  React.useImperativeHandle(handleRef, () => ({
    reveal: (id) => {
      const wasOpen = !collapsed.has(id);
      setCollapsed((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
      // a closed block opens first (CollapseHeight caps its motion at 340ms);
      // then the photos come into view and the first upload takes focus
      window.setTimeout(
        () => {
          const el = photoRefs.current[id];
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          el?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
        },
        wasOpen ? 0 : 360,
      );
    },
  }));

  const setPackage = (id: string, patch: Partial<PackingPackage>) =>
    onChange({ ...value, packages: value.packages.map((pk) => (pk.id === id ? { ...pk, ...patch } : pk)) });
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

      <div className="space-y-3">
        {many && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
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
                onRemove={many ? () => onChange({ ...value, packages: value.packages.filter((x) => x.id !== pk.id) }) : undefined}
                left={left}
                leave={leave}
                photosRef={(el) => {
                  photoRefs.current[pk.id] = el;
                }}
              />
            </li>
          ))}
        </ol>
        <Button
          type="button"
          variant="dashed"
          className="w-full"
          onClick={() => onChange({ ...value, packages: [...value.packages, newPackingPackage()] })}
        >
          <Plus /> {p("addPackage")}
        </Button>
      </div>

      <div className="border-t border-border pt-6">
        <Field label={p("currency")} hint={p("currencyHint")}>
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
          <p role="status" className="mt-5 flex gap-2 rounded-md bg-info/10 px-3 py-2.5 text-sm">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-info" />
            {p("estimateNoSpecial").replace("{min}", kg(pricing.specialFromKg)).replace("{kg}", kg(checkedKg))}
          </p>
        ) : (
          <p className="mt-5 text-xs leading-relaxed text-muted">
            {pricing.packed ? p("estimatePacked") : p("estimatePending")}
          </p>
        )}
      </div>
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
  photosRef,
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
  photosRef: (el: HTMLDivElement | null) => void;
}) {
  const t = useT();
  const p = (k: string) => t(`expatOrder.packing.${k}`);
  const regionId = `package-${pkg.id}`;

  const measure = (side: "weight" | "length" | "width" | "height") => {
    const k = `${pkg.id}.${side}`;
    const v = Number.parseFloat(pkg[side]);
    const error = left[k] && !(v > 0) ? (pkg[side] ? p("aboveZero") : p("required")) : undefined;
    return (
      <Field label={p(side)} error={error}>
        <UnitInput
          unit={side === "weight" ? "kg" : "cm"}
          value={pkg[side]}
          onChange={(e) => onChange({ [side]: decimal(e.target.value) })}
          onBlur={leave(k)}
          placeholder="0"
        />
      </Field>
    );
  };

  const other = pkg.packaging === "other";
  const count = pkg.items.reduce((s, it) => s + (Number.parseFloat(it.quantity) || 0), 0);
  const done = packageMeasured(pkg) && packagingDescribed(pkg) && pkg.items.every(itemDescribed);
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
          className="-my-2 flex min-w-0 flex-1 items-center gap-2 rounded-sm py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        >
          {/* swap, never rotate: the shared disclosure idiom */}
          {open ? (
            <ChevronUp aria-hidden className="size-4 shrink-0 text-muted-2" />
          ) : (
            <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-2" />
          )}
          <span className="shrink-0 font-display text-sm font-semibold">{p("packageN").replace("{n}", String(n))}</span>
          {!open && <span className="truncate text-sm text-muted">{summary}</span>}
        </button>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            aria-label={p("removePackage").replace("{n}", String(n))}
            className="-my-2 shrink-0 text-muted hover:bg-surface-3 hover:text-danger"
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
                error={left[`${pkg.id}.packagingOther`] && !packagingDescribed(pkg) ? p("required") : undefined}
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
          </div>

          <fieldset>
            <legend className="text-sm font-medium">{p("inside")}</legend>
            <ul className="mt-1 divide-y divide-border">
              {pkg.items.map((it, j) => {
                const nameErr = left[`${it.id}.name`] && !it.name.trim() ? p("required") : undefined;
                const qtyErr = left[`${it.id}.qty`] && !(Number.parseFloat(it.quantity) >= 1) ? p("required") : undefined;
                return (
                  <li
                    key={it.id}
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
              onClick={() => onChange({ items: [...pkg.items, newPackingItem()] })}
              className="link-mark tap-row relative mt-1 inline-flex items-center gap-1.5 text-sm"
            >
              <Plus aria-hidden className="size-4" /> {p("addItem")}
            </button>
            <p className="mt-3 text-xs text-muted">{p("valuesHint")}</p>
          </fieldset>

          <div ref={photosRef} className="scroll-mt-24">
            <p className="text-sm font-medium">
              {p("photos")} <span className="font-normal text-muted">· {p("photosOptional")}</span>
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">{p("photosHint")}</p>
            {/* one column on a phone: two upload boxes side by side leave no
                room for the file's name */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {PHOTO_SIDES.map((side) => (
                <Field key={side} label={<span className="text-xs">{p(`photoSides.${side}`)}</span>}>
                  <FileUpload
                    accept="image/*"
                    label={`${p("photos")}: ${p(`photoSides.${side}`)}`}
                    value={pkg.photos[side]}
                    onChange={(name) => onChange({ photos: { ...pkg.photos, [side]: name || undefined } })}
                  />
                </Field>
              ))}
            </div>
          </div>
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

/** the WNI flow's warning, kept: photos never block, but confirming without
 *  them is a choice the customer makes knowingly */
export function MissingPhotosDialog({
  open,
  onOpenChange,
  onAdd,
  onContinue,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
  onContinue: () => void;
}) {
  const t = useT();
  const p = (k: string) => t(`expatOrder.packing.${k}`);
  // going to add photos hands focus to the first upload, not back to Confirm
  const adding = React.useRef(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        onCloseAutoFocus={(e) => {
          if (adding.current) e.preventDefault();
          adding.current = false;
        }}
      >
        <DialogHeader>
          <DialogTitle>{p("photoWarnTitle")}</DialogTitle>
          <DialogDescription>{p("photoWarnBody")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onContinue}>
            {p("photoWarnContinue")}
          </Button>
          <Button
            type="button"
            onClick={() => {
              adding.current = true;
              onAdd();
            }}
          >
            {p("photoWarnAdd")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
