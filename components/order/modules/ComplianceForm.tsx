"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Plus, Trash2, Info } from "lucide-react";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { FileUpload } from "../FileUpload";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Input, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModuleShell, useSaveModule, readModuleData, Field } from "./shared";

interface DocSpec {
  key: string;
  labelKey: string;
  required?: boolean;
  noteKey?: string;
  helpKey?: string;
  personalOnly?: boolean;
}

/** Back For Good (import into Indonesia) document set. */
const BFG_DOCS: DocSpec[] = [
  { key: "ktp", labelKey: "order.coKtp", required: true },
  { key: "passport", labelKey: "order.coPassport", required: true },
  { key: "flightTicket", labelKey: "order.coFlightTicket", noteKey: "order.coBeforePickup" },
  { key: "enpwp", labelKey: "order.coEnpwp", noteKey: "order.coBeforeClearance" },
  { key: "skp", labelKey: "order.coSKP", noteKey: "order.coBeforeClearance", personalOnly: true },
  {
    key: "proofOfStay",
    labelKey: "order.coProofOfStay",
    helpKey: "order.coProofOfStayHelp",
    noteKey: "order.coBeforeClearance",
    personalOnly: true,
  },
];

/** Moving Abroad (export → destination country) document set. */
const EXPORT_DOCS: DocSpec[] = [
  { key: "passport", labelKey: "order.coPassport", required: true },
  { key: "visa", labelKey: "order.coVisa", helpKey: "order.coVisaHelp", required: true },
  { key: "flightTicket", labelKey: "order.coFlightTicket", noteKey: "order.coBeforePickup" },
  { key: "ktp", labelKey: "order.coKtp" },
];

interface ComplianceData {
  docs: Record<string, string>;
  otherDocs: { name: string; file?: string }[];
}

export function ComplianceForm() {
  const t = useT();
  const save = useSaveModule("compliance");
  const clearance = useOrderStore((s) => s.clearance);
  const isExport = useOrderStore((s) => s.context?.service === "moving-abroad");
  const activeDocs = isExport ? EXPORT_DOCS : BFG_DOCS;
  const prev = readModuleData("compliance") as Partial<ComplianceData>;

  const {
    control,
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ComplianceData>({
    defaultValues: {
      docs: prev.docs ?? {},
      otherDocs: prev.otherDocs ?? [],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "otherDocs" });

  const docs = activeDocs.filter((d) => !d.personalOnly || clearance === "personal");

  const onSubmit = (data: ComplianceData) => {
    const missing = docs.filter((d) => d.required && !data.docs?.[d.key]);
    if (missing.length) {
      setError("root", { message: t("order.coMandatoryNote") });
      return;
    }
    clearErrors("root");
    save(data as unknown as Record<string, unknown>);
  };

  return (
    <ModuleShell moduleId="compliance">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card className="space-y-4 p-5">
          <p className="text-sm font-medium">{t("order.coHeading")}</p>
          {docs.map((d) => (
            <div key={d.key}>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted">
                  {t(d.labelKey)}
                  {d.required && <span className="ml-0.5 text-danger">*</span>}
                </span>
                {d.noteKey && (
                  <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] text-muted-2">
                    {t(d.noteKey)}
                  </span>
                )}
              </div>
              <Controller
                control={control}
                name={`docs.${d.key}` as const}
                render={({ field }) => (
                  <FileUpload value={field.value} onChange={field.onChange} />
                )}
              />
              {d.helpKey && (
                <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-2">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  {t(d.helpKey)}
                </p>
              )}
            </div>
          ))}
        </Card>

        {/* other supporting documents */}
        <Card className="space-y-3 p-5">
          <p className="text-sm font-medium">{t("order.coOtherDocs")}</p>
          {fields.map((f, i) => (
            <div key={f.id} className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <Input
                placeholder={t("order.coOtherDocName")}
                className="sm:w-1/3"
                {...register(`otherDocs.${i}.name`)}
              />
              <div className="flex-1">
                <Controller
                  control={control}
                  name={`otherDocs.${i}.file` as const}
                  render={({ field }) => (
                    <FileUpload value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="grid size-11 shrink-0 place-items-center rounded-md text-muted transition-colors hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ name: "", file: "" })}
            className="inline-flex items-center gap-1.5 text-sm link-mark"
          >
            <Plus className="size-4" /> {t("order.coAddOtherDoc")}
          </button>
        </Card>

        {errors.root && <FieldError>{errors.root.message as string}</FieldError>}

        <Button type="submit" size="lg" className="w-full">
          {t("order.saveModule")}
        </Button>
      </form>
    </ModuleShell>
  );
}
