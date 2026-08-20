"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Package } from "lucide-react";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { useCalculatorStore } from "@/lib/store/useCalculatorStore";
import { totalChargeableWeight } from "@/lib/utils/chargeable-weight";
import { formatIDR, formatNumber } from "@/lib/utils/currency";
import { defaultCurrencyFor } from "@/lib/data/currencies";
import { emptyPackage, type ItemsData } from "@/lib/types/packing";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  PackagesEditor,
  photosComplete,
  firstMissingPhotos,
  type PackagesEditorHandle,
} from "@/components/shared/forms/PackagesEditor";
import {
  ModuleShell,
  useSaveModule,
  useInvalidHandler,
  useDraftAutosave,
  readModuleData,
} from "./shared";

export function ItemsForm() {
  const t = useT();
  const save = useSaveModule("items");
  const context = useOrderStore((s) => s.context);
  const selectedRate = useOrderStore((s) => s.selectedRate);
  const submitted = useCalculatorStore((s) => s.submitted);
  const prev = readModuleData("items") as Partial<ItemsData>;
  const editorRef = React.useRef<PackagesEditorHandle | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, isDirty },
  } = useForm<ItemsData>({
    // focus is handled by useInvalidHandler, in document order
    shouldFocusError: false,
    defaultValues: {
      currency:
        prev.currency ??
        (context?.service === "moving-abroad"
          ? "USD"
          : defaultCurrencyFor(context?.originCountry)),
      packages: prev.packages?.length ? prev.packages : [structuredClone(emptyPackage)],
    },
  });

  const onInvalid = useInvalidHandler();
  useDraftAutosave(
    "items",
    getValues as unknown as () => Record<string, unknown>,
    isDirty,
  );

  const packages = watch("packages") ?? [];
  const totalCw = totalChargeableWeight(
    packages.map((p) => ({
      weight: Number(p?.weight) || 0,
      length: Number(p?.length) || 0,
      width: Number(p?.width) || 0,
      height: Number(p?.height) || 0,
      quantity: 1,
    })),
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
    const idx = firstMissingPhotos(packages);
    if (idx >= 0) editorRef.current?.jumpTo(idx);
  };

  return (
    <TooltipProvider delayDuration={150}>
    <ModuleShell moduleId="items">
      <form
        noValidate
        onSubmit={handleSubmit(onValid, (errs) => {
          editorRef.current?.expandAll(); // surface errors hidden inside collapsed packages
          onInvalid(errs);
        })}
        className="space-y-4"
      >
        <PackagesEditor
          control={control}
          register={register}
          errors={errors}
          watch={watch}
          showPhotos
          editorRef={editorRef}
          currencyNote={
            submitted && submitted.packages.length > 0 ? (
              <p className="flex items-center gap-2 text-xs text-muted-2">
                <Package className="size-3.5" /> {t("order.itFromCalc")}:{" "}
                {submitted.packages
                  .map(
                    (p) =>
                      `${formatNumber(Number(p.weight) || 0)}kg ${Number(p.length) || 0}×${Number(p.width) || 0}×${Number(p.height) || 0}`,
                  )
                  .join(" · ")}
              </p>
            ) : null
          }
          extraTotals={[
            {
              label: t("order.itTotalPrice"),
              value: totalPrice === null ? "–" : formatIDR(totalPrice),
              accent: true,
              mono: true,
            },
          ]}
          // a bare dash on the money line reads as a bug; say why it is empty
          totalsNote={
            totalPrice === null
              ? t("order.itNoRateNote")
              : t("order.itEstimateNote")
          }
        />

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
