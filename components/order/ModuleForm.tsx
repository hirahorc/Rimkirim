"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { ArrowLeft, Plus, Trash2, Package } from "lucide-react";
import { useOrderStore, type ModuleId } from "@/lib/store/useOrderStore";
import { useCalculatorStore } from "@/lib/store/useCalculatorStore";
import { getModuleMeta } from "./module-meta";
import { useT } from "@/lib/i18n/LanguageProvider";
import { getCountry } from "@/lib/data/countries";
import { formatNumber } from "@/lib/utils/currency";
import { Card } from "@/components/ui/card";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/** Shared shell: back link, title, and a slot for the form. */
function ModuleShell({
  moduleId,
  children,
}: {
  moduleId: ModuleId;
  children: React.ReactNode;
}) {
  const t = useT();
  const meta = getModuleMeta(moduleId);
  return (
    <div>
      <Link
        href="/pesan/modul"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {t("order.stepForm")}
      </Link>
      <h1 className="mb-5 font-display text-2xl font-bold tracking-tight">
        {meta ? t(meta.titleKey) : ""}
      </h1>
      {children}
    </div>
  );
}

function useSaveModule(moduleId: ModuleId) {
  const router = useRouter();
  const saveModule = useOrderStore((s) => s.saveModule);
  return (data: Record<string, unknown>) => {
    saveModule(moduleId, data);
    router.push("/pesan/modul");
  };
}

function readData(moduleId: ModuleId): Record<string, unknown> {
  return useOrderStore.getState().modules[moduleId].data ?? {};
}

// ------------------------------------------------------------------ //
//  Customer Information                                               //
// ------------------------------------------------------------------ //
function CustomerInfoForm() {
  const t = useT();
  const save = useSaveModule("customerInfo");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, string>>({ defaultValues: readData("customerInfo") as Record<string, string> });

  const req = { required: t("err.required") };

  return (
    <form onSubmit={handleSubmit(save)} className="space-y-4">
      <Card className="space-y-4 p-5">
        <div>
          <Label>{t("order.ciFullName")}</Label>
          <Input {...register("fullName", req)} />
          <FieldError>{errors.fullName?.message}</FieldError>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{t("order.ciEmail")}</Label>
            <Input type="email" {...register("email", req)} />
            <FieldError>{errors.email?.message}</FieldError>
          </div>
          <div>
            <Label>{t("order.ciPhone")}</Label>
            <Input {...register("phone", req)} />
            <FieldError>{errors.phone?.message}</FieldError>
          </div>
        </div>
        <div>
          <Label>{t("order.ciIdNumber")}</Label>
          <Input {...register("idNumber", req)} />
          <FieldError>{errors.idNumber?.message}</FieldError>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <p className="text-sm font-medium">{t("order.ciAddrHeading")}</p>
        <div>
          <Label>{t("order.ciStreet")}</Label>
          <Input {...register("street", req)} />
          <FieldError>{errors.street?.message}</FieldError>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>{t("order.ciCity")}</Label>
            <Input {...register("city", req)} />
            <FieldError>{errors.city?.message}</FieldError>
          </div>
          <div>
            <Label>{t("order.ciProvince")}</Label>
            <Input {...register("province", req)} />
            <FieldError>{errors.province?.message}</FieldError>
          </div>
          <div>
            <Label>{t("order.ciPostal")}</Label>
            <Input {...register("postal", req)} />
            <FieldError>{errors.postal?.message}</FieldError>
          </div>
        </div>
      </Card>

      <Button type="submit" size="lg" className="w-full">
        {t("order.saveModule")}
      </Button>
    </form>
  );
}

// ------------------------------------------------------------------ //
//  Item & Packages                                                    //
// ------------------------------------------------------------------ //
interface ItemsForm {
  items: { desc: string; category: string; qty: number; value: number }[];
}
function ItemsForm() {
  const t = useT();
  const save = useSaveModule("items");
  const submitted = useCalculatorStore((s) => s.submitted);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemsForm>({
    defaultValues:
      (readData("items") as unknown as ItemsForm)?.items?.length
        ? (readData("items") as unknown as ItemsForm)
        : { items: [{ desc: "", category: "", qty: 1, value: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  return (
    <form onSubmit={handleSubmit((d) => save(d as unknown as Record<string, unknown>))} className="space-y-4">
      {/* packages carried from the calculator (read-only) */}
      {submitted && submitted.packages.length > 0 && (
        <Card className="p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Package className="size-4 text-brand" /> {t("order.itFromCalc")}
          </p>
          <ul className="space-y-1 text-sm text-muted">
            {submitted.packages.map((p, i) => (
              <li key={i}>
                {formatNumber(Number(p.weight) || 0)} kg · {Number(p.length) || 0}×
                {Number(p.width) || 0}×{Number(p.height) || 0} cm × {Number(p.quantity) || 1}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="space-y-3">
        {fields.map((f, i) => (
          <Card key={f.id} className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-2">
                {t("order.modItems")} {i + 1}
              </span>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-danger"
                >
                  <Trash2 className="size-3.5" /> {t("order.itRemove")}
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <Label>{t("order.itDesc")}</Label>
                <Input {...register(`items.${i}.desc`, { required: t("err.required") })} />
                <FieldError>{errors.items?.[i]?.desc?.message}</FieldError>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <Label>{t("order.itCategory")}</Label>
                  <Input {...register(`items.${i}.category`)} />
                </div>
                <div>
                  <Label>{t("order.itQty")}</Label>
                  <Input type="number" min="1" {...register(`items.${i}.qty`, { valueAsNumber: true })} />
                </div>
                <div>
                  <Label>{t("order.itValue")}</Label>
                  <Input type="number" min="0" {...register(`items.${i}.value`, { valueAsNumber: true })} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <button
        type="button"
        onClick={() => append({ desc: "", category: "", qty: 1, value: 0 })}
        className="inline-flex items-center gap-2 rounded-sm border border-dashed border-border-strong px-3 py-2 text-sm text-muted transition-colors hover:border-brand/50 hover:text-brand"
      >
        <Plus className="size-4" /> {t("order.itAdd")}
      </button>

      <Button type="submit" size="lg" className="w-full">
        {t("order.saveModule")}
      </Button>
    </form>
  );
}

// ------------------------------------------------------------------ //
//  Compliance Document                                                //
// ------------------------------------------------------------------ //
interface DocSpec {
  key: string;
  labelKey: string;
  required?: boolean;
  personalOnly?: boolean;
}
const DOCS: DocSpec[] = [
  { key: "passport", labelKey: "order.coPassport", required: true },
  { key: "skp", labelKey: "order.coSKP", personalOnly: true },
  { key: "invoice", labelKey: "order.coInvoice" },
  { key: "packingList", labelKey: "order.coPackingList", required: true },
];

function ComplianceForm() {
  const t = useT();
  const save = useSaveModule("compliance");
  const clearance = useOrderStore((s) => s.clearance);
  const answers = useOrderStore((s) => s.answers);
  const prev = readData("compliance") as Record<string, unknown>;

  const { control, register, handleSubmit, setError, formState: { errors } } = useForm<
    Record<string, unknown>
  >({
    defaultValues: {
      ...prev,
      packingCode: (prev.packingCode as string) ?? answers.packingCode ?? "",
    },
  });

  const requiredDocs = DOCS.filter(
    (d) => d.required || (d.personalOnly && clearance === "personal"),
  );

  const onSubmit = (data: Record<string, unknown>) => {
    const missing = requiredDocs.filter((d) => !data[`doc_${d.key}`]);
    if (missing.length) {
      setError("root", { message: t("err.required") });
      return;
    }
    save(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card className="space-y-3 p-5">
        <p className="text-sm font-medium">{t("order.coHeading")}</p>
        {DOCS.map((doc) => {
          const show = !doc.personalOnly || clearance === "personal";
          if (!show) return null;
          const required = doc.required || (doc.personalOnly && clearance === "personal");
          return (
            <div key={doc.key} className="rounded-sm border border-border bg-surface-2/50 p-3">
              <Controller
                control={control}
                name={`doc_${doc.key}`}
                render={({ field }) => (
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                    <Checkbox
                      checked={Boolean(field.value)}
                      onCheckedChange={(v) => field.onChange(Boolean(v))}
                    />
                    <span className="font-medium">
                      {t(doc.labelKey)}
                      {required && <span className="ml-1 text-brand">*</span>}
                    </span>
                  </label>
                )}
              />
              <Input
                className="mt-2"
                placeholder={t("order.coUploadPlaceholder")}
                {...register(`note_${doc.key}`)}
              />
            </div>
          );
        })}
      </Card>

      <Card className="p-5">
        <Label>{t("order.coPackingCode")}</Label>
        <Input {...register("packingCode")} placeholder={t("order.packingCodePlaceholder")} />
      </Card>

      {errors.root && <FieldError>{errors.root.message as string}</FieldError>}

      <Button type="submit" size="lg" className="w-full">
        {t("order.saveModule")}
      </Button>
    </form>
  );
}

// ------------------------------------------------------------------ //
//  Pickup Details & Schedule                                          //
// ------------------------------------------------------------------ //
function PickupForm() {
  const t = useT();
  const save = useSaveModule("pickup");
  const context = useOrderStore((s) => s.context);
  const origin = getCountry(context?.originCountry)?.name ?? "";
  const prev = readData("pickup") as Record<string, string>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, string>>({
    defaultValues: { pickupAddress: origin ? `${origin}` : "", ...prev },
  });
  const req = { required: t("err.required") };

  return (
    <form onSubmit={handleSubmit(save)} className="space-y-4">
      <Card className="space-y-4 p-5">
        <div>
          <Label>{t("order.puAddress")}</Label>
          <Input {...register("pickupAddress", req)} />
          <FieldError>{errors.pickupAddress?.message}</FieldError>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{t("order.puContactName")}</Label>
            <Input {...register("contactName", req)} />
            <FieldError>{errors.contactName?.message}</FieldError>
          </div>
          <div>
            <Label>{t("order.puContactPhone")}</Label>
            <Input {...register("contactPhone", req)} />
            <FieldError>{errors.contactPhone?.message}</FieldError>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{t("order.puDate")}</Label>
            <Input type="date" {...register("date", req)} />
            <FieldError>{errors.date?.message}</FieldError>
          </div>
          <div>
            <Label>{t("order.puWindow")}</Label>
            <select
              {...register("window", req)}
              className={cn(
                "flex h-11 w-full rounded-md border border-border bg-surface-2 px-3 text-sm text-foreground",
                "focus-visible:outline-none focus-visible:border-brand/70 focus-visible:ring-2 focus-visible:ring-brand/25",
              )}
            >
              <option value="">—</option>
              <option value="morning">{t("order.puWindowMorning")}</option>
              <option value="afternoon">{t("order.puWindowAfternoon")}</option>
              <option value="evening">{t("order.puWindowEvening")}</option>
            </select>
            <FieldError>{errors.window?.message}</FieldError>
          </div>
        </div>
        <div>
          <Label>{t("order.puNotes")}</Label>
          <Input {...register("notes")} />
        </div>
      </Card>

      <Button type="submit" size="lg" className="w-full">
        {t("order.saveModule")}
      </Button>
    </form>
  );
}

const FORMS: Record<ModuleId, React.ComponentType> = {
  customerInfo: CustomerInfoForm,
  items: ItemsForm,
  compliance: ComplianceForm,
  pickup: PickupForm,
};

export function ModuleForm({ moduleId }: { moduleId: string }) {
  const router = useRouter();
  const isValid = (id: string): id is ModuleId => id in FORMS;

  React.useEffect(() => {
    if (!isValid(moduleId)) router.replace("/pesan/modul");
  }, [moduleId, router]);

  if (!isValid(moduleId)) return null;
  const Form = FORMS[moduleId];
  return (
    <ModuleShell moduleId={moduleId}>
      <Form />
    </ModuleShell>
  );
}
