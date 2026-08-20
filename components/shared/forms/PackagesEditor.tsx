"use client";

import * as React from "react";
import {
  useFieldArray,
  Controller,
  type Control,
  type UseFormRegister,
  type UseFormWatch,
  type FieldErrors,
  type FieldValues,
} from "react-hook-form";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { totalChargeableWeight } from "@/lib/utils/chargeable-weight";
import { formatNumber } from "@/lib/utils/currency";
import { CURRENCIES, formatCurrency } from "@/lib/data/currencies";
import { emptyPackage, type ItemsData, type PackageRow } from "@/lib/types/packing";
import { PACKAGING_TYPES } from "@/components/order/module-options";
import { FileUpload } from "@/components/order/FileUpload";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { InfoTip } from "@/components/ui/tooltip";
import { Field } from "./Field";
import { cn } from "@/lib/utils/cn";

const PHOTO_KEYS = ["weight", "length", "width", "height"] as const;

/** True when every package has all four measurement photos. */
export function photosComplete(pkgs: PackageRow[] | undefined): boolean {
  return (pkgs ?? []).every((p) => PHOTO_KEYS.every((k) => Boolean(p?.photos?.[k])));
}

/** Index of the first package missing a measurement photo, or -1. */
export function firstMissingPhotos(pkgs: PackageRow[] | undefined): number {
  return (pkgs ?? []).findIndex((p) => !PHOTO_KEYS.every((k) => Boolean(p?.photos?.[k])));
}

export interface PackagesEditorHandle {
  expandAll: () => void;
  /** open a package card and scroll it into view */
  jumpTo: (index: number) => void;
}

export interface TotalCell {
  label: string;
  value: string;
  accent?: boolean;
  mono?: boolean;
}

/**
 * Currency + the packages/items list + totals — the body of the order's
 * Items & Packages module, reused by the standalone packing list. Any form
 * whose values include `currency` and `packages` can host it; the parent
 * owns the <form>, the submit button and any surrounding shell.
 */
export function PackagesEditor<T extends FieldValues & ItemsData>({
  control: controlT,
  register: registerT,
  errors: errorsT,
  watch: watchT,
  showPhotos,
  currencyNote,
  extraTotals = [],
  totalsNote,
  editorRef,
}: {
  control: Control<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  watch: UseFormWatch<T>;
  /** measurement-photo uploads per package (order flow only) */
  showPhotos: boolean;
  /** rendered under the currency select (e.g. "from calculator" hint) */
  currencyNote?: React.ReactNode;
  /** totals shown before the standard value + chargeable-weight cells */
  extraTotals?: TotalCell[];
  /** one quiet line under the totals (e.g. how the estimate is computed) */
  totalsNote?: React.ReactNode;
  editorRef?: React.RefObject<PackagesEditorHandle | null>;
}) {
  const t = useT();
  // the field names are the same in every host form, so narrow once here
  const control = controlT as unknown as Control<ItemsData>;
  const register = registerT as unknown as UseFormRegister<ItemsData>;
  const errors = errorsT as unknown as FieldErrors<ItemsData>;
  const watch = watchT as unknown as UseFormWatch<ItemsData>;

  const { fields, append, remove } = useFieldArray({ control, name: "packages" });

  // Collapse UI state (does not touch form values). Track COLLAPSED ids keyed by
  // stable field.id, so a freshly-appended package defaults to open.
  const [collapsedIds, setCollapsedIds] = React.useState<Set<string>>(() => new Set());
  const cardRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const isOpen = (id: string) => !collapsedIds.has(id);
  const toggle = (id: string) =>
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const expandAll = () => setCollapsedIds(new Set());
  const collapseAll = () => setCollapsedIds(new Set(fields.map((f) => f.id)));
  const anyOpen = fields.some((f) => !collapsedIds.has(f.id));
  const jumpTo = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    // wait for the block to render open before scrolling
    requestAnimationFrame(() =>
      cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  React.useImperativeHandle(editorRef, () => ({
    expandAll,
    jumpTo: (index) => {
      const f = fields[index];
      if (f) jumpTo(f.id);
    },
  }));

  const currency = watch("currency");
  const packages = watch("packages") ?? [];

  const dims = packages.map((p) => ({
    weight: Number(p?.weight) || 0,
    length: Number(p?.length) || 0,
    width: Number(p?.width) || 0,
    height: Number(p?.height) || 0,
    quantity: 1,
  }));
  const totalCw = totalChargeableWeight(dims);
  const totalValue = packages.reduce(
    (sum, p) =>
      sum +
      (p?.items ?? []).reduce(
        (s, it) => s + (Number(it?.value) || 0) * (Number(it?.quantity) || 0),
        0,
      ),
    0,
  );

  const totals: TotalCell[] = [
    ...extraTotals,
    { label: t("order.itTotalValue"), value: formatCurrency(totalValue, currency), mono: true },
    { label: t("order.itTotalCw"), value: `${formatNumber(totalCw)} kg` },
  ];

  return (
    <>

      {/* packages section header: title + count, collapse control, jump chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display font-semibold">
            {t("order.itPackagesHeading")}
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted tabular-nums">
              {fields.length}
            </span>
          </h2>
          {fields.length > 1 && (
            <button
              type="button"
              onClick={anyOpen ? collapseAll : expandAll}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-border-strong hover:text-foreground"
            >
              <ChevronDown
                className={cn("size-3.5 transition-transform", !anyOpen && "-rotate-90")}
              />
              {anyOpen ? t("order.itCollapseAll") : t("order.itExpandAll")}
            </button>
          )}
        </div>
        {fields.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-2">{t("order.itJumpTo")}:</span>
            <div className="flex flex-wrap gap-1.5">
              {fields.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => jumpTo(f.id)}
                  className="grid size-7 place-items-center rounded-sm border border-border text-xs font-medium text-muted transition-colors hover:border-border-strong hover:text-foreground"
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {fields.map((f, i) => (
        <div key={f.id} ref={(el) => { cardRefs.current[f.id] = el; }}>
          <PackageBlock
            index={i}
            control={control}
            register={register}
            errors={errors}
            pkg={packages[i]}
            currency={currency}
            open={isOpen(f.id)}
            onToggle={() => toggle(f.id)}
            onRemove={() => remove(i)}
            removable={fields.length > 1}
            showPhotos={showPhotos}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => append(structuredClone(emptyPackage))}
        className="inline-flex items-center gap-2 rounded-sm border border-dashed border-border-strong px-3 py-2 text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
      >
        <Plus className="size-4" /> {t("order.itAddPackage")}
      </button>

      {/* currency — demoted below the packages: it is a customs-declaration
          detail, not the reason the user came to this page */}
      <Card className="space-y-4 p-5">
        <h2 className="font-display font-semibold">{t("order.itCurrency")}</h2>
        <Field hint={t("order.itCurrencyHelp")}>
          <Controller
            control={control}
            name="currency"
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={field.onChange}
                ariaLabel={t("order.itCurrency")}
                wrapperClassName="sm:max-w-xs"
                searchable
                searchPlaceholder={t("order.itCurrencySearch")}
                emptyText={t("order.itCurrencyEmpty")}
                options={CURRENCIES.map((c) => ({
                  value: c.code,
                  label: `${c.code} – ${c.name}`,
                }))}
              />
            )}
          />
        </Field>
        {currencyNote}
      </Card>

      {/* totals */}
      <Card
        className={cn(
          "grid gap-4 p-5",
          totals.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
        )}
      >
        {totals.map((c) => (
          <Total key={c.label} {...c} />
        ))}
        {totalsNote && (
          <p className="text-xs leading-snug text-muted-2 sm:col-span-full">
            {totalsNote}
          </p>
        )}
      </Card>
    </>
  );
}

function Total({ label, value, accent, mono }: TotalCell) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-2">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-lg font-bold tracking-tight",
          mono ? "font-mono tabular-nums" : "font-display",
          accent && "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function PackageBlock({
  index,
  control,
  register,
  errors,
  pkg,
  currency,
  open,
  onToggle,
  onRemove,
  removable,
  showPhotos,
}: {
  index: number;
  control: Control<ItemsData>;
  register: UseFormRegister<ItemsData>;
  errors: FieldErrors<ItemsData>;
  pkg: PackageRow | undefined;
  currency: string;
  open: boolean;
  onToggle: () => void;
  onRemove: () => void;
  removable: boolean;
  showPhotos: boolean;
}) {
  const t = useT();
  const pErr = errors.packages?.[index];
  const { fields, append, remove } = useFieldArray({
    control,
    name: `packages.${index}.items`,
  });
  const req = { required: t("err.required") };
  const photoKeys = [
    ["weight", "order.itPhotoWeight"],
    ["length", "order.itPhotoLength"],
    ["width", "order.itPhotoWidth"],
    ["height", "order.itPhotoHeight"],
  ] as const;

  // One-line summary shown when collapsed, so each package is identifiable.
  const w = Number(pkg?.weight) || 0;
  const l = Number(pkg?.length) || 0;
  const wd = Number(pkg?.width) || 0;
  const h = Number(pkg?.height) || 0;
  const pkgItems = pkg?.items ?? [];
  const itemCount = pkgItems.filter((it) => (it?.name ?? "").trim()).length;
  const pkgTotalItems = pkgItems.reduce((s, it) => s + (Number(it?.quantity) || 0), 0);
  const pkgTotalValue = pkgItems.reduce(
    (s, it) => s + (Number(it?.quantity) || 0) * (Number(it?.value) || 0),
    0,
  );
  const hasAny = w > 0 || l > 0 || wd > 0 || h > 0 || itemCount > 0;
  const summary = hasAny
    ? [
        w > 0 && `${formatNumber(w)}kg`,
        (l > 0 || wd > 0 || h > 0) && `${l}×${wd}×${h}`,
        itemCount > 0 && `${itemCount} ${t("order.itItemsWord")}`,
      ]
        .filter(Boolean)
        .join(" · ")
    : t("order.itPackageEmpty");
  const hasError = Boolean(pErr);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggle}
          // the whole header line is the toggle; padding gives it a 36px hit
          className="-my-2 flex min-w-0 flex-1 items-center gap-2 py-2 text-left"
          aria-expanded={open}
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted transition-transform",
              !open && "-rotate-90",
            )}
          />
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-2">
            {t("order.itPackageN")} {index + 1}
          </span>
          {!open && (
            <span className={cn("truncate text-xs", hasError ? "text-danger" : "text-muted")}>
              {summary}
            </span>
          )}
        </button>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="-my-2 inline-flex min-h-9 shrink-0 items-center gap-1 py-2 text-xs text-muted transition-colors hover:text-danger"
          >
            <Trash2 className="size-3.5" /> {t("order.itRemove")}
          </button>
        )}
      </div>

      {!open ? null : (
      <div className="mt-4 space-y-4">
      <Field label={t("order.itPackaging")}>
        <Controller
          control={control}
          name={`packages.${index}.packaging`}
          render={({ field }) => (
            <SelectField
              value={field.value}
              onChange={field.onChange}
              ariaLabel={t("order.itPackaging")}
              options={PACKAGING_TYPES.map((p) => ({
                value: p.value,
                label: t(p.labelKey),
              }))}
            />
          )}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label={t("pkg.berat")} error={pErr?.weight?.message}>
          <Input type="number" step="0.1" min="0" placeholder="0" {...register(`packages.${index}.weight`, { valueAsNumber: true, ...req })} />
        </Field>
        <Field label={t("pkg.length")} error={pErr?.length?.message}>
          <Input type="number" min="0" placeholder="0" {...register(`packages.${index}.length`, { valueAsNumber: true, ...req })} />
        </Field>
        <Field label={t("pkg.width")} error={pErr?.width?.message}>
          <Input type="number" min="0" placeholder="0" {...register(`packages.${index}.width`, { valueAsNumber: true, ...req })} />
        </Field>
        <Field label={t("pkg.height")} error={pErr?.height?.message}>
          <Input type="number" min="0" placeholder="0" {...register(`packages.${index}.height`, { valueAsNumber: true, ...req })} />
        </Field>
      </div>

      {/* items inside — one card per item, mirroring the calculator package cards */}
      <div>
        <p className="mb-2 text-sm font-medium">{t("order.itItemsHeading")}</p>

        <div className="space-y-3">
          {fields.map((f, j) => {
            const it = pkg?.items?.[j];
            const rowTotal = (Number(it?.quantity) || 0) * (Number(it?.value) || 0);
            const removable = fields.length > 1;
            return (
              <div key={f.id} className="rounded-sm border border-border bg-surface-2/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {t("order.itItemN")} {j + 1}
                  </span>
                  {removable && (
                    <button
                      type="button"
                      onClick={() => remove(j)}
                      className="-my-2 inline-flex min-h-9 items-center gap-1 py-2 text-xs text-muted transition-colors hover:text-danger"
                    >
                      <Trash2 className="size-3.5" /> {t("order.itRemove")}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="col-span-2">
                    <Field label={t("order.itColDescription")} error={pErr?.items?.[j]?.name?.message}>
                      <Input placeholder={t("order.itItemName")} {...register(`packages.${index}.items.${j}.name`, req)} />
                    </Field>
                  </div>
                  <Field label={t("order.itColQty")}>
                    <Input type="number" min="1" placeholder="0" {...register(`packages.${index}.items.${j}.quantity`, { valueAsNumber: true })} />
                  </Field>
                  <Field label={t("order.itColValue")}>
                    <PrefixedInput
                      prefix={currency}
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register(`packages.${index}.items.${j}.value`, { valueAsNumber: true })}
                    />
                  </Field>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-sm bg-surface/70 px-3 py-2 text-xs">
                  <span className="text-muted">{t("order.itColTotal")}</span>
                  <span className="font-medium text-foreground tabular-nums">
                    {currency} {formatNumber(rowTotal)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => append({ name: "", value: undefined as unknown as number, quantity: 1 })}
          className="mt-3 inline-flex min-h-9 items-center gap-1.5 py-2 text-xs link-mark"
        >
          <Plus className="size-3.5" /> {t("order.itAdd")}
        </button>

        {/* per-package summary — filled strip, footer of the items list (mobile-first) */}
        <div className="mt-3 flex flex-col gap-2 rounded-sm bg-surface-2/60 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted">
            {t("order.itPkgTotalItems")}:{" "}
            <span className="font-medium text-foreground tabular-nums">{pkgTotalItems}</span>
          </span>
          <span className="text-muted">
            {t("order.itPkgTotalValue")}:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {currency} {formatNumber(pkgTotalValue)}
            </span>
          </span>
        </div>
      </div>

      {/* measurement photos */}
      {showPhotos && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
            {t("order.itPhotos")}
            <InfoTip content={t("order.itPhotosTooltip")} label={t("order.itPhotos")} />
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {photoKeys.map(([key, labelKey]) => (
              <Field key={key} label={<span className="text-xs">{t(labelKey)}</span>}>
                <Controller
                  control={control}
                  name={`packages.${index}.photos.${key}` as const}
                  render={({ field }) => (
                    <FileUpload
                      accept="image/*"
                      label={`${t("order.itPhotos")}: ${t(labelKey)}`}
                      value={field.value as string | undefined}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Field>
            ))}
          </div>
        </div>
      )}
      </div>
      )}
    </Card>
  );
}

/** An Input with a quiet currency prefix; forwards `Field`'s wiring to the input. */
const PrefixedInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { prefix: string }
>(({ prefix, className, ...props }, ref) => (
  <div className="relative">
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-2">
      {prefix}
    </span>
    <Input ref={ref} className={cn("pl-12", className)} {...props} />
  </div>
));
PrefixedInput.displayName = "PrefixedInput";
