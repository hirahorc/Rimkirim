"use client";

import {
  useForm,
  useFieldArray,
  Controller,
  type Control,
  type UseFormRegister,
  type FieldErrors,
} from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2, Package } from "lucide-react";
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
import { ModuleShell, useSaveModule, readModuleData, Field } from "./shared";
import { cn } from "@/lib/utils/cn";

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

const selectCls =
  "flex h-11 w-full rounded-md border border-border bg-surface-2 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:border-brand/70 focus-visible:ring-2 focus-visible:ring-brand/25";

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

  return (
    <ModuleShell moduleId="items">
      <form
        onSubmit={handleSubmit(
          (d) => save(d as unknown as Record<string, unknown>),
          () => toast.error(t("calc.invalidTitle")),
        )}
        className="space-y-4"
      >
        {/* currency + carried packages */}
        <Card className="space-y-4 p-5">
          <Field label={t("order.itCurrency")}>
            <select {...register("currency")} className={cn(selectCls, "sm:max-w-xs")}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
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

        {fields.map((f, i) => (
          <PackageBlock
            key={f.id}
            index={i}
            control={control}
            register={register}
            errors={errors}
            onRemove={() => remove(i)}
            removable={fields.length > 1}
          />
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
    </ModuleShell>
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
  onRemove,
  removable,
}: {
  index: number;
  control: Control<ItemsData>;
  register: UseFormRegister<ItemsData>;
  errors: FieldErrors<ItemsData>;
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

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-2">
          {t("order.itPackageN")} {index + 1}
        </span>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-danger"
          >
            <Trash2 className="size-3.5" /> {t("order.itRemove")}
          </button>
        )}
      </div>

      <Field label={t("order.itPackaging")}>
        <select {...register(`packages.${index}.packaging`)} className={selectCls}>
          {PACKAGING_TYPES.map((p) => (
            <option key={p.value} value={p.value}>
              {t(p.labelKey)}
            </option>
          ))}
        </select>
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

      {/* items inside */}
      <div>
        <p className="mb-2 text-sm font-medium">{t("order.itItemsHeading")}</p>
        <div className="space-y-2">
          {fields.map((f, j) => (
            <div key={f.id} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
              <Input placeholder={t("order.itItemName")} {...register(`packages.${index}.items.${j}.name`, req)} />
              <Input type="number" min="0" placeholder={t("order.itValue")} className="sm:w-28" {...register(`packages.${index}.items.${j}.value`, { valueAsNumber: true })} />
              <Input type="number" min="1" placeholder={t("order.itQty")} className="sm:w-20" {...register(`packages.${index}.items.${j}.quantity`, { valueAsNumber: true })} />
              {fields.length > 1 ? (
                <button type="button" onClick={() => remove(j)} className="grid size-11 place-items-center rounded-md text-muted transition-colors hover:text-danger">
                  <Trash2 className="size-4" />
                </button>
              ) : (
                <span className="size-11" />
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => append({ name: "", value: undefined as unknown as number, quantity: 1 })}
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand hover:underline"
        >
          <Plus className="size-3.5" /> {t("order.itAdd")}
        </button>
      </div>

      {/* measurement photos */}
      <div>
        <p className="mb-2 text-sm font-medium">{t("order.itPhotos")}</p>
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
    </Card>
  );
}
