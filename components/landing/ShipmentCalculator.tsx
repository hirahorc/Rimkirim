"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { SurchargeInfoDialog } from "@/components/rates/SurchargeInfoDialog";
import { useT } from "@/lib/i18n/LanguageProvider";
import { PackageRow } from "./PackageRow";

type PackageField = CalculatorValues["packages"][number];

/**
 * A fresh package row starts completely empty so the inputs show their
 * placeholders instead of pre-filled zeros. React Hook Form renders an empty
 * uncontrolled input for `undefined`; the cast is needed because
 * `useFieldArray.append()` is typed to the fully-populated package shape.
 */
const emptyPackage = {
  weight: undefined,
  length: undefined,
  width: undefined,
  height: undefined,
  quantity: undefined,
  nonStandardPackaging: false,
  nonStackable: false,
} as unknown as PackageField;

export function ShipmentCalculator() {
  const router = useRouter();
  const t = useT();
  const setSubmitted = useCalculatorStore((s) => s.setSubmitted);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CalculatorValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      service: "bfg",
      mode: "base",
      origin: { country: "", city: "", postalCode: "", detail: "" },
      destination: { country: INDONESIA.code, city: "", postalCode: "", detail: "" },
      packages: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "packages" });

  const service = watch("service");
  const mode = watch("mode");
  const packages = watch("packages");
  const originLocked = service === "moving-abroad";
  const destLocked = service === "bfg";

  /**
   * Switching direction swaps the two endpoints, so the foreign country the user
   * already picked carries over to the other side (and an empty field stays empty).
   * The newly locked endpoint is then pinned to Indonesia.
   */
  const handleServiceChange = (
    next: CalculatorValues["service"],
    commit: (v: CalculatorValues["service"]) => void,
  ) => {
    if (next === service) return;

    const prevOrigin = getValues("origin");
    const prevDestination = getValues("destination");

    setValue("origin", prevDestination, { shouldValidate: false });
    setValue("destination", prevOrigin, { shouldValidate: false });

    if (next === "bfg") {
      setValue("destination.country", INDONESIA.code);
    } else {
      setValue("origin.country", INDONESIA.code);
    }

    commit(next);
  };

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

  const onInvalid = () => {
    toast.error(t("calc.invalidTitle"), {
      description:
        mode === "advance" ? t("calc.invalidAdvance") : t("calc.invalidBase"),
    });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        id="kalkulator"
        className="relative overflow-hidden rounded-md border border-border-strong bg-surface/90 shadow-2xl shadow-black/40 backdrop-blur"
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
                onValueChange={(v) =>
                  v &&
                  handleServiceChange(
                    v as CalculatorValues["service"],
                    field.onChange,
                  )
                }
              >
                <SegmentedItem value="bfg">
                  <Home className="size-4" /> {t("calc.serviceBfg")}
                </SegmentedItem>
                <SegmentedItem value="moving-abroad">
                  <Plane className="size-4" /> {t("calc.serviceMa")}
                </SegmentedItem>
              </SegmentedRoot>
            )}
          />
          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted">
            <Info className="size-3.5" />
            {service === "bfg" ? t("calc.bfgHint") : t("calc.maHint")}
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
                  <Gauge className="size-4" /> {t("calc.modeBase")}
                </SegmentedItem>
                <SegmentedItem value="advance">
                  <SlidersHorizontal className="size-4" /> {t("calc.modeAdvance")}
                </SegmentedItem>
              </SegmentedRoot>
            )}
          />
          <span className="hidden text-xs text-muted sm:block">
            {mode === "base" ? t("calc.baseHint") : t("calc.advanceHint")}
          </span>
        </div>

        {/* Route */}
        <div className="relative grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <Label>{t("calc.originCountry")}</Label>
            <Controller
              control={control}
              name="origin.country"
              render={({ field }) => (
                <CountrySelect
                  value={field.value}
                  onChange={field.onChange}
                  locked={originLocked}
                  // origin is the foreign endpoint here, so Indonesia is not an option
                  exclude={INDONESIA.code}
                  placeholder={t("calc.fromPlaceholder")}
                />
              )}
            />
            <FieldError>{t(errors.origin?.country?.message ?? "")}</FieldError>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <Label>{t("calc.city")}</Label>
                <Input placeholder={t("calc.cityOriginPh")} {...register("origin.city")} />
              </div>
              <div>
                <Label>{t("calc.postalCode")}</Label>
                <Input placeholder={t("calc.postalPh")} {...register("origin.postalCode")} />
              </div>
            </div>
          </div>

          <div>
            <Label>{t("calc.destCountry")}</Label>
            <Controller
              control={control}
              name="destination.country"
              render={({ field }) => (
                <CountrySelect
                  value={field.value}
                  onChange={field.onChange}
                  locked={destLocked}
                  // destination is the foreign endpoint here, so Indonesia is not an option
                  exclude={INDONESIA.code}
                  placeholder={t("calc.toPlaceholder")}
                />
              )}
            />
            <FieldError>{t(errors.destination?.country?.message ?? "")}</FieldError>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <Label>{t("calc.city")}</Label>
                <Input placeholder={t("calc.cityDestPh")} {...register("destination.city")} />
              </div>
              <div>
                <Label>{t("calc.postalCode")}</Label>
                <Input placeholder={t("calc.postalPh")} {...register("destination.postalCode")} />
              </div>
            </div>
          </div>
        </div>

        {/* Advance-only: packages */}
        {mode === "advance" && (
          <div className="relative animate-fade-up border-t border-border p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-display text-sm font-semibold">
                <PackagePlus className="size-4 text-brand" /> {t("calc.detailPaket")}
              </h4>
              {liveChargeable > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  {t("calc.totalChargeable")}
                  <Badge variant="brand">{formatNumber(liveChargeable)} kg</Badge>
                </span>
              )}
            </div>

            <p className="mb-3 flex items-start gap-1.5 text-xs text-muted-2">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              <span>
                {t("calc.surchargeNote")}{" "}
                <SurchargeInfoDialog>
                  <button
                    type="button"
                    className="font-medium text-brand hover:underline"
                  >
                    {t("calc.lihatJenisSurcharge")}
                  </button>
                </SurchargeInfoDialog>
              </span>
            </p>

            <div className="space-y-3">
              {fields.map((f, i) => (
                <PackageRow
                  key={f.id}
                  index={i}
                  control={control}
                  register={register}
                  errors={errors}
                  values={packages?.[i]}
                  onRemove={() => remove(i)}
                  removable={fields.length > 1}
                />
              ))}
            </div>

            {typeof errors.packages?.message === "string" && (
              <FieldError>{t(errors.packages.message)}</FieldError>
            )}

            <button
              type="button"
              onClick={() => append({ ...emptyPackage })}
              className="mt-3 inline-flex items-center gap-2 rounded-sm border border-dashed border-border-strong px-3 py-2 text-sm text-muted transition-colors hover:border-brand/50 hover:text-brand"
            >
              <Plus className="size-4" /> {t("calc.tambahPaket")}
            </button>
          </div>
        )}

        {/* Submit */}
        <div className="relative border-t border-border p-5 sm:p-6">
          <Button type="submit" size="lg" className="w-full">
            {t("calc.cekHarga")}
            <ArrowRight className="size-4" />
          </Button>
          <p className="mt-2 text-center text-xs text-muted">
            {mode === "base" ? t("calc.submitBaseHint") : t("calc.submitAdvanceHint")}
          </p>
        </div>
      </form>
    </TooltipProvider>
  );
}
