"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useOrderStore, type ModuleId } from "@/lib/store/useOrderStore";
import { getModuleMeta } from "../module-meta";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Label, FieldError } from "@/components/ui/input";

/** Back link + module title shell. */
export function ModuleShell({
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

/** Save the module data (marks complete) and return to the hub. */
export function useSaveModule(moduleId: ModuleId) {
  const router = useRouter();
  const saveModule = useOrderStore((s) => s.saveModule);
  return (data: Record<string, unknown>) => {
    saveModule(moduleId, data);
    router.push("/pesan/modul");
  };
}

/** Read the current draft data for a module (once, for form defaults). */
export function readModuleData(moduleId: ModuleId): Record<string, unknown> {
  return useOrderStore.getState().modules[moduleId].data ?? {};
}

/** Labeled field wrapper with optional hint + error. */
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      {children}
      {hint && <p className="mt-1 text-xs text-muted-2">{hint}</p>}
      <FieldError>{error}</FieldError>
    </div>
  );
}
