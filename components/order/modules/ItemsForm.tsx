"use client";

import * as React from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  type Control,
  type UseFormRegister,
  type FieldErrors,
} from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2, Package, ChevronDown } from "lucide-react";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { useCalculatorStore } from "@/lib/store/useCalculatorStore";
import { totalChargeableWeight } from "@/lib/utils/chargeable-weight";
import { formatIDR, formatNumber } from "@/lib/utils/currency";
import {
  CURRENCIES,
  defaultCurrencyFor,
  formatCurrency,
} from "@/lib/data/currencies";
import { PACKAGING_TYPES } from "../module-options";
import { FileUpload } from "../FileUpload";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TooltipProvider, InfoTip } from "@/components/ui/tooltip";
import { ModuleShell, useSaveModule, readModuleData, Field } from "./shared";
import { cn } from "@/lib/utils/cn";

const PHOTO_KEYS = ["weight", "length", "width", "height"] as const;

/** True when every package has all four measurement photos. */
function photosComplete(pkgs: PackageRowT[] | undefined): boolean {
  return (pkgs ?? []).every((p) =>
    PHOTO_KEYS.every((k) => Boolean(p?.photos?.[k])),
  );
}

interface ItemRow {
  name: string;
  value: number;
  quantity: number;
}
interface PackageRowT {
  packaging: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  items: ItemRow[];
  photos: { weight?: string; length?: string; width?: string; height?: string };
}
interface ItemsData {
  currency: string;
  packages: PackageRowT[];
}


const emptyPackage: PackageRowT = {
  packaging: "box",
  weight: undefined as unknown as number,
  length: undefined as unknown as number,
  width: undefined as unknown as number,
  height: undefined as unknown as number,
  items: [{ name: "", value: undefined as unknown as number, quantity: 1 }],
  photos: {},
};

export function ItemsForm() {
  const t = useT();
  const save = useSaveModule("items");
  const context = useOrderStore((s) => s.context);
  const selectedRate = useOrderStore((s) => s.selectedRate);
  const submitted = useCalculatorStore((s) => s.submitted);
  const prev = readModuleData("items") as Partial<ItemsData>;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ItemsData>({
    defaultValues: {
      currency: prev.currency ?? defaultCurrencyFor(context?.originCountry),
      packages: prev.packages?.length ? prev.packages : [structuredClone(emptyPackage)],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "packages" });

  // Collapse UI state (does not touch form values). Track COLLAPSED ids keyed by
  // stable field.id, so a freshly-appended package defaults to open.
  const [collapsedIds, setCollapsedIds] = React.useState<Set<string>>(
    () => new Set(),
  );
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
  const totalPrice = selectedRate ? selectedRate.perKg * totalCw : null;

  // Warn (not block) when saving without complete measurement photos.
  const [photoWarnOpen, setPhotoWarnOpen] = React.useState(false);
  const pendingSave = React.useRef<ItemsData | null>(null);

  const onValid = (d: ItemsData) => {
    if (!photosComplete(d.packages)) {
      pendingSave.current = d;
      setPhotoWarnOpen(true);
      return;
    }
    save(d as unknown as Record<string, unknown>);
  };
  const saveAnyway = () => {
    setPhotoWarnOpen(false);
    if (pendingSave.current) save(pendingSave.current as unknown as Record<string, unknown>);
  };
  const gotoFirstMissingPhotos = () => {
    setPhotoWarnOpen(false);
    const idx = packages.findIndex(
      (p) => !PHOTO_KEYS.every((k) => Boolean(p?.photos?.[k])),
    );
    if (idx >= 0) {
      const id = fields[idx].id;
      setCollapsedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      requestAnimationFrame(() =>
        cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
    <ModuleShell moduleId="items">
      <form
        onSubmit={handleSubmit(onValid, () => {
          expandAll(); // surface errors hidden inside collapsed packages
          toast.error(t("calc.invalidTitle"));
        })}
        className="space-y-4"
      >
        {/* currency + carried packages */}
        <Card className="space-y-4 p-5">
          <Field label={t("order.itCurrency")} hint={t("order.itCurrencyHelp")}>
            <Select {...register("currency")} wrapperClassName="sm:max-w-xs">
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </Select>
          </Field>
          {submitted && submitted.packages.length > 0 && (
            <p className="flex items-center gap-2 text-xs text-muted-2">
              <Package className="size-3.5" /> {t("order.itFromCalc")}:{" "}
              {submitted.packages
                .map(
                  (p) =>
                    `${formatNumber(Number(p.weight) || 0)}kg ${Number(p.length) || 0}×${Number(p.width) || 0}×${Number(p.height) || 0}`,
                )
                .join(" · ")}
            </p>
          )}
        </Card>

        {/* packages section header: title + count, collapse control, jump chips */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 font-display font-semibold">
              {t("order.itPackagesHeading")}
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted tabular-nums">
                {fields.length}
              </span>
            </h3>
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
                    className="grid size-7 place-items-center rounded-sm border border-border text-xs font-medium text-muted transition-colors hover:border-brand/50 hover:text-brand"
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
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => append(structuredClone(emptyPackage))}
          className="inline-flex items-center gap-2 rounded-sm border border-dashed border-border-strong px-3 py-2 text-sm text-muted transition-colors hover:border-brand/50 hover:text-brand"
        >
          <Plus className="size-4" /> {t("order.itAddPackage")}
        </button>

        {/* totals */}
        <Card className="grid gap-4 p-5 sm:grid-cols-3">
          <Total label={t("order.itTotalPrice")} value={totalPrice === null ? "—" : formatIDR(totalPrice)} accent />
          <Total label={t("order.itTotalValue")} value={formatCurrency(totalValue, currency)} />
          <Total label={t("order.itTotalCw")} value={`${formatNumber(totalCw)} kg`} />
        </Card>

        <Button type="submit" size="lg" className="w-full">
          {t("order.saveModule")}
        </Button>
      </form>

      {/* warn when saving without complete measurement photos */}
      <Dialog open={photoWarnOpen} onOpenChange={setPhotoWarnOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("order.itPhotoWarnTitle")}</DialogTitle>
            <DialogDescription>{t("order.itPhotoWarnBody")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 p-6 pt-0 sm:flex-row-reverse">
            <Button type="button" onClick={gotoFirstMissingPhotos} className="sm:flex-1">
              {t("order.itPhotoWarnUpload")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={saveAnyway}
              className="sm:flex-1"
            >
              {t("order.itPhotoWarnContinue")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ModuleShell>
    </TooltipProvider>
  );
}

function Total({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-2">{label}</p>
      <p className={cn("mt-0.5 font-display text-lg font-bold tracking-tight", accent && "text-brand")}>
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
}: {
  index: number;
  control: Control<ItemsData>;
  register: UseFormRegister<ItemsData>;
  errors: FieldErrors<ItemsData>;
  pkg: PackageRowT | undefined;
  currency: string;
  open: boolean;
  onToggle: () => void;
  onRemove: () => void;
  removable: boolean;
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
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
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
            <span
              className={cn(
                "truncate text-xs",
                hasError ? "text-danger" : "text-muted",
              )}
            >
              {summary}
            </span>
          )}
        </button>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex shrink-0 items-center gap-1 text-xs text-muted transition-colors hover:text-danger"
          >
            <Trash2 className="size-3.5" /> {t("order.itRemove")}
          </button>
        )}
      </div>

      {!open ? null : (
      <div className="mt-4 space-y-4">
      <Field label={t("order.itPackaging")}>
        <Select {...register(`packages.${index}.packaging`)}>
          {PACKAGING_TYPES.map((p) => (
            <option key={p.value} value={p.value}>
              {t(p.labelKey)}
            </option>
          ))}
        </Select>
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
                      className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-danger"
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
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-2">
                        {currency}
                      </span>
                      <Input type="number" min="0" placeholder="0" className="pl-12" {...register(`packages.${index}.items.${j}.value`, { valueAsNumber: true })} />
                    </div>
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
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-brand hover:underline"
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
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
          {t("order.itPhotos")}
          <InfoTip content={t("order.itPhotosTooltip")} />
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
                    value={field.value as string | undefined}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
          ))}
        </div>
      </div>
      </div>
      )}
    </Card>
  );
}
