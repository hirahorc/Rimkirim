"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useOrderStore, type ModuleId } from "@/lib/store/useOrderStore";
import { getModuleMeta } from "../module-meta";
import { useT } from "@/lib/i18n/LanguageProvider";

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

/* The module completed on the way back to the hub, so the hub can play its
   one-time completion animation. In-memory on purpose: a page refresh forgets
   it, and the animation only belongs to the moment right after saving. */
let justSaved: ModuleId | null = null;
export function consumeJustSaved(): ModuleId | null {
  const v = justSaved;
  justSaved = null;
  return v;
}

/** Save the module data (marks complete), confirm it, and return to the hub. */
export function useSaveModule(moduleId: ModuleId) {
  const router = useRouter();
  const t = useT();
  const saveModule = useOrderStore((s) => s.saveModule);
  return (data: Record<string, unknown>) => {
    saveModule(moduleId, data);
    const meta = getModuleMeta(moduleId);
    toast.success(`${meta ? t(meta.titleKey) : ""} ${t("order.moduleSavedToast")}`.trim());
    justSaved = moduleId;
    router.push("/pesan/modul");
  };
}

/** Read the current draft data for a module (once, for form defaults). */
export function readModuleData(moduleId: ModuleId): Record<string, unknown> {
  return useOrderStore.getState().modules[moduleId].data ?? {};
}

export { Field } from "@/components/shared/forms/Field";
