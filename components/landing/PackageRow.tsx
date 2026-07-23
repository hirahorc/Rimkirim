"use client";

import { Trash2 } from "lucide-react";
import type {
  UseFormRegister,
  FieldErrors,
} from "react-hook-form";
import type { CalculatorValues } from "@/lib/schemas/calculator";
import {
  volumetricWeight,
  chargeableWeight,
  chargedBasis,
  rowChargeableWeight,
} from "@/lib/utils/chargeable-weight";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

interface PackageRowProps {
  index: number;
  register: UseFormRegister<CalculatorValues>;
  errors: FieldErrors<CalculatorValues>;
  values: CalculatorValues["packages"][number];
  onRemove: () => void;
  removable: boolean;
}

export function PackageRow({
  index,
  register,
  errors,
  values,
  onRemove,
  removable,
}: PackageRowProps) {
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

  return (
    <div className="rounded-lg border border-border bg-surface-2/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-2">
          Paket {index + 1}
        </span>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 text-xs text-muted-2 transition-colors hover:text-danger"
          >
            <Trash2 className="size-3.5" /> Hapus
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        <div className="col-span-2 sm:col-span-2">
          <Label>Berat (kg)</Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            placeholder="0"
            {...register(`packages.${index}.weight`, { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label>P (cm)</Label>
          <Input type="number" min="0" placeholder="0" {...register(`packages.${index}.length`, { valueAsNumber: true })} />
        </div>
        <div>
          <Label>L (cm)</Label>
          <Input type="number" min="0" placeholder="0" {...register(`packages.${index}.width`, { valueAsNumber: true })} />
        </div>
        <div>
          <Label>T (cm)</Label>
          <Input type="number" min="0" placeholder="0" {...register(`packages.${index}.height`, { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Qty</Label>
          <Input type="number" min="1" placeholder="1" {...register(`packages.${index}.quantity`, { valueAsNumber: true })} />
        </div>
      </div>

      {(pkgErr?.weight || pkgErr?.length || pkgErr?.width || pkgErr?.height) && (
        <FieldError>
          {pkgErr?.weight?.message ||
            pkgErr?.length?.message ||
            pkgErr?.width?.message ||
            pkgErr?.height?.message}
        </FieldError>
      )}

      {/* live chargeable weight */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md bg-surface/70 px-3 py-2 text-xs">
        <span className="text-muted-2">
          Aktual:{" "}
          <span className={cn("font-medium text-foreground", basis === "actual" && "text-brand")}>
            {formatNumber(dims.weight)} kg
          </span>
        </span>
        <span className="text-muted-2">
          Volumetrik:{" "}
          <span className={cn("font-medium text-foreground", basis === "volumetric" && "text-brand")}>
            {formatNumber(vol)} kg
          </span>
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="text-muted-2">Chargeable:</span>
          <Badge variant="brand">{formatNumber(chg)} kg</Badge>
          {dims.quantity > 1 && (
            <span className="text-muted-2">× {dims.quantity} = {formatNumber(rowTotal)} kg</span>
          )}
        </span>
      </div>
    </div>
  );
}
