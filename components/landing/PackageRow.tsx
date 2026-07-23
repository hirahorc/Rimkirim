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

  /** nothing entered yet — show "—" instead of zeros */
  const untouched = !dims.weight && !hasDims;
  const kg = (v: number) => (untouched ? "—" : `${formatNumber(v)} kg`);

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
          <Label>{t("pkg.berat")}</Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            placeholder="0"
            {...register(`packages.${index}.weight`, { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label>{t("pkg.length")}</Label>
          <Input type="number" min="0" placeholder="0" {...register(`packages.${index}.length`, { valueAsNumber: true })} />
        </div>
        <div>
          <Label>{t("pkg.width")}</Label>
          <Input type="number" min="0" placeholder="0" {...register(`packages.${index}.width`, { valueAsNumber: true })} />
        </div>
        <div>
          <Label>{t("pkg.height")}</Label>
          <Input type="number" min="0" placeholder="0" {...register(`packages.${index}.height`, { valueAsNumber: true })} />
        </div>
        <div>
          <Label>{t("pkg.qty")}</Label>
          <Input type="number" min="1" placeholder="1" {...register(`packages.${index}.quantity`, { valueAsNumber: true })} />
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

      {/* live chargeable weight */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-sm bg-surface/70 px-3 py-2 text-xs">
        <span className="flex items-center gap-1 text-muted">
          {t("pkg.aktual")}{" "}
          <span
            className={cn(
              "font-medium text-foreground",
              !untouched && basis === "actual" && "text-brand",
            )}
          >
            {kg(dims.weight)}
          </span>
        </span>
        <span className="flex items-center gap-1 text-muted">
          {t("pkg.volumetrik")}{" "}
          <span
            className={cn(
              "font-medium text-foreground",
              !untouched && basis === "volumetric" && "text-brand",
            )}
          >
            {kg(vol)}
          </span>
          <InfoTip content={t("pkg.volTooltip")} />
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-muted">
            {t("pkg.chargeable")}
            <InfoTip content={t("pkg.chgTooltip")} />
          </span>
          <Badge variant={untouched ? "neutral" : "brand"}>{kg(chg)}</Badge>
          {!untouched && dims.quantity > 1 && (
            <span className="text-muted">
              × {dims.quantity} = {formatNumber(rowTotal)} kg
            </span>
          )}
        </span>
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
