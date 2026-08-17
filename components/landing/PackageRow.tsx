"use client";

import { Trash2 } from "lucide-react";
import type {
  UseFormRegister,
  FieldErrors,
  Control,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import type { CalculatorValues } from "@/lib/schemas/calculator";
import {
  volumetricWeight,
  chargeableWeight,
  chargedBasis,
  rowChargeableWeight,
} from "@/lib/utils/chargeable-weight";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { InfoTip } from "@/components/ui/tooltip";
import { formatNumber } from "@/lib/utils/currency";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

interface PackageRowProps {
  index: number;
  control: Control<CalculatorValues>;
  register: UseFormRegister<CalculatorValues>;
  errors: FieldErrors<CalculatorValues>;
  values: CalculatorValues["packages"][number];
  onRemove: () => void;
  removable: boolean;
}

export function PackageRow({
  index,
  control,
  register,
  errors,
  values,
  onRemove,
  removable,
}: PackageRowProps) {
  const t = useT();
  const dims = {
    weight: Number(values?.weight) || 0,
    length: Number(values?.length) || 0,
    width: Number(values?.width) || 0,
    height: Number(values?.height) || 0,
    quantity: Number(values?.quantity) || 1,
  };
  const hasDims = dims.length > 0 && dims.width > 0 && dims.height > 0;
  const vol = hasDims ? volumetricWeight(dims) : 0;
  const chg = hasDims || dims.weight ? chargeableWeight(dims) : 0;
  const basis = chargedBasis(dims);
  const rowTotal = rowChargeableWeight(dims);
  const pkgErr = errors.packages?.[index];

  /** nothing entered yet — show "–" instead of zeros */
  const untouched = !dims.weight && !hasDims;
  const kg = (v: number) => (untouched ? "–" : `${formatNumber(v)} kg`);

  return (
    <div className="rounded-sm border border-border bg-surface-2/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          {t("pkg.paket")} {index + 1}
        </span>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-danger"
          >
            <Trash2 className="size-3.5" /> {t("pkg.hapus")}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        <div className="col-span-2 sm:col-span-2">
          <Label htmlFor={`pkg-${index}-weight`}>{t("pkg.berat")}</Label>
          <Input
            id={`pkg-${index}-weight`}
            type="number"
            step="0.1"
            min="0"
            placeholder="0"
            {...register(`packages.${index}.weight`, { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label htmlFor={`pkg-${index}-length`}>{t("pkg.length")}</Label>
          <Input id={`pkg-${index}-length`} type="number" min="0" placeholder="0" {...register(`packages.${index}.length`, { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor={`pkg-${index}-width`}>{t("pkg.width")}</Label>
          <Input id={`pkg-${index}-width`} type="number" min="0" placeholder="0" {...register(`packages.${index}.width`, { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor={`pkg-${index}-height`}>{t("pkg.height")}</Label>
          <Input id={`pkg-${index}-height`} type="number" min="0" placeholder="0" {...register(`packages.${index}.height`, { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor={`pkg-${index}-qty`}>{t("pkg.qty")}</Label>
          <Input id={`pkg-${index}-qty`} type="number" min="1" placeholder="1" {...register(`packages.${index}.quantity`, { valueAsNumber: true })} />
        </div>
      </div>

      {(pkgErr?.weight || pkgErr?.length || pkgErr?.width || pkgErr?.height) && (
        <FieldError>
          {t(
            pkgErr?.weight?.message ||
              pkgErr?.length?.message ||
              pkgErr?.width?.message ||
              pkgErr?.height?.message ||
              "",
          )}
        </FieldError>
      )}

      {/* live chargeable weight — aligned readout: stacked rows on mobile, 3 columns on sm+ */}
      <div className="mt-3 overflow-hidden rounded-sm bg-surface/70 text-xs">
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex items-center justify-between gap-3 px-3 py-2 sm:flex-col sm:items-start sm:gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-2">
              {t("pkg.aktual")}
            </span>
            <span
              className={cn(
                "font-medium tabular-nums text-foreground",
                !untouched && basis === "actual" && "text-foreground",
              )}
            >
              {kg(dims.weight)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 px-3 py-2 sm:flex-col sm:items-start sm:gap-1">
            <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-2">
              {t("pkg.volumetrik")}
              <InfoTip content={t("pkg.volTooltip")} label={t("pkg.volumetrik")} />
            </span>
            <span
              className={cn(
                "font-medium tabular-nums text-foreground",
                !untouched && basis === "volumetric" && "text-foreground",
              )}
            >
              {kg(vol)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 px-3 py-2 sm:flex-col sm:items-start sm:gap-1">
            <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-2">
              {t("pkg.chargeable")}
              <InfoTip content={t("pkg.chgTooltip")} label={t("pkg.chargeable")} />
            </span>
            <Badge variant={untouched ? "neutral" : "brand"}>{kg(chg)}</Badge>
          </div>
        </div>
        {!untouched && dims.quantity > 1 && (
          <div className="border-t border-border px-3 py-1.5 text-xs text-muted-2">
            {t("pkg.chargeable")} × {dims.quantity} ={" "}
            <span className="font-medium tabular-nums text-foreground">
              {formatNumber(rowTotal)} kg
            </span>
          </div>
        )}
      </div>

      {/* per-package optional conditions */}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Controller
          control={control}
          name={`packages.${index}.nonStandardPackaging`}
          render={({ field }) => (
            <label className="flex cursor-pointer items-start gap-2 text-xs text-muted">
              <Checkbox
                checked={field.value}
                onCheckedChange={(v) => field.onChange(Boolean(v))}
                aria-label={t("pkg.packagingLabel")}
              />
              <span>
                {t("pkg.packagingLabel")}
                <span className="ml-1 text-muted-2">{t("pkg.packagingHint")}</span>
              </span>
            </label>
          )}
        />
        <Controller
          control={control}
          name={`packages.${index}.nonStackable`}
          render={({ field }) => (
            <label className="flex cursor-pointer items-start gap-2 text-xs text-muted">
              <Checkbox
                checked={field.value}
                onCheckedChange={(v) => field.onChange(Boolean(v))}
                aria-label={t("pkg.nonStackableLabel")}
              />
              <span>
                {t("pkg.nonStackableLabel")}
                <span className="ml-1 text-muted-2">{t("pkg.nonStackableHint")}</span>
              </span>
            </label>
          )}
        />
      </div>
    </div>
  );
}
