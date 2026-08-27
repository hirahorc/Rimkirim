"use client";

import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { Plus, Trash2, Info } from "lucide-react";
import { toast } from "sonner";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { FileUpload } from "../FileUpload";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Input, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModuleShell, useSaveModule, readModuleData } from "./shared";

export interface DocSpec {
  key: string;
  labelKey: string;
  required?: boolean;
  noteKey?: string;
  helpKey?: string;
  personalOnly?: boolean;
}

/** Back For Good (import into Indonesia) document set. */
export const BFG_DOCS: DocSpec[] = [
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
export const EXPORT_DOCS: DocSpec[] = [
  { key: "passport", labelKey: "order.coPassport", required: true },
  { key: "visa", labelKey: "order.coVisa", helpKey: "order.coVisaHelp", required: true },
  { key: "flightTicket", labelKey: "order.coFlightTicket", noteKey: "order.coBeforePickup" },
  { key: "ktp", labelKey: "order.coKtp" },
];

interface ComplianceData {
  docs: Record<string, string>;
  /** compressed data URLs, keyed like `docs` — the record page's previews.
      Parallel to (not replacing) the filenames, so older drafts stay valid. */
  docFiles?: Record<string, string>;
  otherDocs: { name: string; file?: string; fileData?: string }[];
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
    setValue,
    formState: { errors },
  } = useForm<ComplianceData>({
    defaultValues: {
      docs: prev.docs ?? {},
      docFiles: prev.docFiles ?? {},
      otherDocs: prev.otherDocs ?? [],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "otherDocs" });
  // subscription-based (unlike `watch()`), so the compiler can memoize safely
  const docFilesValues = useWatch({ control, name: "docFiles" });
  const otherDocsValues = useWatch({ control, name: "otherDocs" });

  const docs = activeDocs.filter((d) => !d.personalOnly || clearance === "personal");

  const onSubmit = (data: ComplianceData) => {
    const missing = docs.filter((d) => d.required && !data.docs?.[d.key]);
    if (missing.length) {
      // the error lands on each missing document, not in a summary far below
      missing.forEach((d) =>
        setError(`docs.${d.key}` as const, {
          type: "required",
          message: t("err.required"),
        }),
      );
      toast.error(t("order.coMandatoryNote"));
      return;
    }
    save(data as unknown as Record<string, unknown>);
  };

  return (
    <ModuleShell moduleId="compliance">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card className="space-y-4 px-5 py-7">
          <h2 className="font-display font-semibold">{t("order.coHeading")}</h2>
          {/* each doc is one unit (label + timing pill → control → help); the
              row gap is wider than the intra-row gaps so rows read as distinct */}
          <div className="space-y-5">
            {docs.map((d) => (
              <div key={d.key}>
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-muted">
                    {t(d.labelKey)}
                    {d.required && <span className="ml-0.5 text-danger">*</span>}
                  </span>
                  {d.noteKey && (
                    <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 font-display text-[10px] text-muted-2">
                      {t(d.noteKey)}
                    </span>
                  )}
                </div>
                <Controller
                  control={control}
                  name={`docs.${d.key}` as const}
                  render={({ field }) => (
                    <FileUpload
                      label={t(d.labelKey)}
                      value={field.value}
                      fileData={docFilesValues?.[d.key]}
                      onFileData={(dataUrl) =>
                        setValue(`docFiles.${d.key}` as const, dataUrl ?? "")
                      }
                      onChange={(v) => {
                        field.onChange(v);
                        if (v) clearErrors(`docs.${d.key}` as const);
                      }}
                    />
                  )}
                />
                <FieldError>{errors.docs?.[d.key]?.message}</FieldError>
                {d.helpKey && (
                  <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-2">
                    <Info className="mt-0.5 size-3.5 shrink-0" />
                    {t(d.helpKey)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* other supporting documents */}
        <Card className="space-y-4 px-5 py-7">
          <h2 className="font-display font-semibold">{t("order.coOtherDocs")}</h2>
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
                    <FileUpload
                      label={t("order.coOtherDocs")}
                      value={field.value}
                      fileData={otherDocsValues?.[i]?.fileData}
                      onFileData={(dataUrl) =>
                        setValue(`otherDocs.${i}.fileData` as const, dataUrl ?? "")
                      }
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(i)}
                aria-label={t("order.itRemove")}
                className="size-11 shrink-0 hover:text-danger"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ name: "", file: "", fileData: "" })}
            className="-my-1.5 inline-flex min-h-9 items-center gap-1.5 py-1.5 text-sm link-mark"
          >
            <Plus className="size-4" /> {t("order.coAddOtherDoc")}
          </button>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          {t("order.saveModule")}
        </Button>
      </form>
    </ModuleShell>
  );
}
