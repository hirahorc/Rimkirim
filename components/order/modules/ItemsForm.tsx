"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Package } from "lucide-react";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { useCalculatorStore } from "@/lib/store/useCalculatorStore";
import { useVoucherStore } from "@/lib/store/useVoucherStore";
import { estimateOrder } from "@/lib/voucher/estimate";
import { formatIDR, formatNumber } from "@/lib/utils/currency";
import { EstimateBreakdown } from "@/components/order/EstimateBreakdown";
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
  DialogFooter,
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

  // the live estimate runs the real quotation math over the form's packages,
  // voucher included, so this number and the hub's are the same number
  const voucher = useOrderStore(
    (s) => s.orders.find((o) => o.id === s.activeDraftId)?.voucher ?? null,
  );
  const campaigns = useVoucherStore((s) => s.campaigns);
  const modules = useOrderStore((s) => s.modules);
  const [now] = React.useState(() => Date.now());
  const packages = watch("packages") ?? [];
  const estimate = estimateOrder({
    modules: { ...modules, items: { status: "complete", data: { packages } } },
    selectedRate,
    voucher,
    campaigns,
    now,
  });
  const totalPrice = estimate ? estimate.quotation.total : null;

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
          totalsDetail={estimate ? <EstimateBreakdown estimate={estimate} compact /> : null}
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
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={saveAnyway}>
              {t("order.itPhotoWarnContinue")}
            </Button>
            <Button type="button" onClick={gotoFirstMissingPhotos}>
              {t("order.itPhotoWarnUpload")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleShell>
    </TooltipProvider>
  );
}
