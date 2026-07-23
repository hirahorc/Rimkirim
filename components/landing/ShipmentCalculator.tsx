"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PackagePlus,
  Plus,
  ArrowRight,
  Home,
  Plane,
  Gauge,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import {
  calculatorSchema,
  type CalculatorValues,
} from "@/lib/schemas/calculator";
import { useCalculatorStore } from "@/lib/store/useCalculatorStore";
import { INDONESIA } from "@/lib/data/countries";
import { totalChargeableWeight } from "@/lib/utils/chargeable-weight";
import { formatNumber } from "@/lib/utils/currency";
import { SegmentedRoot, SegmentedItem } from "@/components/ui/toggle-group";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { PackageRow } from "./PackageRow";
import { cn } from "@/lib/utils/cn";

const emptyPackage = {
  weight: 0,
  length: 0,
  width: 0,
  height: 0,
  quantity: 1,
};

export function ShipmentCalculator() {
  const router = useRouter();
  const setSubmitted = useCalculatorStore((s) => s.setSubmitted);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CalculatorValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      service: "bfg",
      mode: "base",
      origin: { country: "", city: "", postalCode: "", detail: "" },
      destination: { country: INDONESIA.code, city: "", postalCode: "", detail: "" },
      packages: [],
      nonStandardPackaging: false,
      nonStackable: false,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "packages" });

  const service = watch("service");
  const mode = watch("mode");
  const packages = watch("packages");
  const originLocked = service === "moving-abroad";
  const destLocked = service === "bfg";

  // keep the locked endpoint pinned to Indonesia
  React.useEffect(() => {
    if (service === "bfg") {
      setValue("destination.country", INDONESIA.code);
    } else {
      setValue("origin.country", INDONESIA.code);
    }
  }, [service, setValue]);

  // ensure Advance mode has at least one package row
  React.useEffect(() => {
    if (mode === "advance" && fields.length === 0) {
      append({ ...emptyPackage });
    }
  }, [mode, fields.length, append]);

  const liveChargeable = totalChargeableWeight(
    (packages ?? []).map((p) => ({
      weight: Number(p?.weight) || 0,
      length: Number(p?.length) || 0,
      width: Number(p?.width) || 0,
      height: Number(p?.height) || 0,
      quantity: Number(p?.quantity) || 1,
    })),
  );

  const onSubmit = (values: CalculatorValues) => {
    setSubmitted(values);
    router.push("/cek-tarif");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      id="kalkulator"
      className="relative overflow-hidden rounded-2xl border border-border-strong bg-surface/90 shadow-2xl shadow-black/40 backdrop-blur"
    >
      <div className="brand-glow pointer-events-none absolute inset-x-0 top-0 h-40" />

      {/* Service toggle */}
      <div className="relative border-b border-border p-5 sm:p-6">
        <Controller
          control={control}
          name="service"
          render={({ field }) => (
            <SegmentedRoot
              type="single"
              value={field.value}
              onValueChange={(v) => v && field.onChange(v)}
            >
              <SegmentedItem value="bfg">
                <Home className="size-4" /> Back For Good
              </SegmentedItem>
              <SegmentedItem value="moving-abroad">
                <Plane className="size-4" /> Moving Abroad
              </SegmentedItem>
            </SegmentedRoot>
          )}
        />
        <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-2">
          <Info className="size-3.5" />
          {service === "bfg"
            ? "Impor: kirim barang dari luar negeri pulang ke Indonesia."
            : "Ekspor: kirim barang dari Indonesia ke luar negeri."}
        </p>
      </div>

      {/* Mode tabs */}
      <div className="relative flex items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <Controller
          control={control}
          name="mode"
          render={({ field }) => (
            <SegmentedRoot
              type="single"
              value={field.value}
              onValueChange={(v) => v && field.onChange(v)}
              className="max-w-xs"
            >
              <SegmentedItem value="base">
                <Gauge className="size-4" /> Base
              </SegmentedItem>
              <SegmentedItem value="advance">
                <SlidersHorizontal className="size-4" /> Advance
              </SegmentedItem>
            </SegmentedRoot>
          )}
        />
        <span className="hidden text-xs text-muted-2 sm:block">
          {mode === "base" ? "Estimasi cepat" : "Hitung akurat + surcharge"}
        </span>
      </div>

      {/* Route */}
      <div className="relative grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <div>
          <Label>Negara Asal</Label>
          <Controller
            control={control}
            name="origin.country"
            render={({ field }) => (
              <CountrySelect
                value={field.value}
                onChange={field.onChange}
                locked={originLocked}
                exclude={watch("destination.country")}
                placeholder="Dari negara…"
              />
            )}
          />
          <FieldError>{errors.origin?.country?.message}</FieldError>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <Label>Kota</Label>
              <Input placeholder="Kota asal" {...register("origin.city")} />
            </div>
            <div>
              <Label>Kode Pos</Label>
              <Input placeholder="Kode pos" {...register("origin.postalCode")} />
            </div>
          </div>
        </div>

        <div>
          <Label>Negara Tujuan</Label>
          <Controller
            control={control}
            name="destination.country"
            render={({ field }) => (
              <CountrySelect
                value={field.value}
                onChange={field.onChange}
                locked={destLocked}
                exclude={watch("origin.country")}
                placeholder="Ke negara…"
              />
            )}
          />
          <FieldError>{errors.destination?.country?.message}</FieldError>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <Label>Kota</Label>
              <Input placeholder="Kota tujuan" {...register("destination.city")} />
            </div>
            <div>
              <Label>Kode Pos</Label>
              <Input placeholder="Kode pos" {...register("destination.postalCode")} />
            </div>
          </div>
        </div>
      </div>

      {/* Advance-only: packages */}
      {mode === "advance" && (
        <div className="relative animate-fade-up border-t border-border p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="flex items-center gap-2 font-display text-sm font-semibold">
              <PackagePlus className="size-4 text-brand" /> Detail Paket
            </h4>
            {liveChargeable > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-muted-2">
                Total chargeable:
                <Badge variant="brand">{formatNumber(liveChargeable)} kg</Badge>
              </span>
            )}
          </div>

          <div className="space-y-3">
            {fields.map((f, i) => (
              <PackageRow
                key={f.id}
                index={i}
                register={register}
                errors={errors}
                values={packages?.[i]}
                onRemove={() => remove(i)}
                removable={fields.length > 1}
              />
            ))}
          </div>

          {typeof errors.packages?.message === "string" && (
            <FieldError>{errors.packages.message}</FieldError>
          )}

          <button
            type="button"
            onClick={() => append({ ...emptyPackage })}
            className="mt-3 inline-flex items-center gap-2 rounded-md border border-dashed border-border-strong px-3 py-2 text-sm text-muted transition-colors hover:border-brand/50 hover:text-brand"
          >
            <Plus className="size-4" /> Tambah paket
          </button>

          {/* optional condition-based surcharges */}
          <div className="mt-4 space-y-2.5 rounded-lg border border-border bg-surface-2/50 p-4">
            <p className="text-xs font-medium text-muted">Kondisi tambahan (opsional)</p>
            <Controller
              control={control}
              name="nonStandardPackaging"
              render={({ field }) => (
                <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(Boolean(v))}
                  />
                  <span className="text-muted">
                    Kemasan luar bukan kardus corrugated / dilapisi plastik / bubble
                    wrap penuh
                    <span className="ml-1 text-muted-2">(Packaging Surcharge)</span>
                  </span>
                </label>
              )}
            />
            <Controller
              control={control}
              name="nonStackable"
              render={({ field }) => (
                <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(Boolean(v))}
                  />
                  <span className="text-muted">
                    Paket tidak bisa ditumpuk
                    <span className="ml-1 text-muted-2">(Non-Stackable, hanya untuk paket Large)</span>
                  </span>
                </label>
              )}
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="relative border-t border-border p-5 sm:p-6">
        <Button type="submit" size="lg" className="w-full">
          Cek Harga
          <ArrowRight className="size-4" />
        </Button>
        <p className="mt-2 text-center text-xs text-muted-2">
          {mode === "base"
            ? "Base mode menampilkan special rate. Butuh harga akurat? Pakai Advance."
            : "Harga sudah termasuk chargeable weight & surcharge sesuai dimensi paket."}
        </p>
      </div>
    </form>
  );
}
