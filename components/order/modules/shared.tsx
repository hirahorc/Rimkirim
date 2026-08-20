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

/** Count the leaf error messages in a react-hook-form errors tree. */
function countErrors(node: unknown): number {
  if (!node || typeof node !== "object") return 0;
  const o = node as Record<string, unknown>;
  if (typeof o.message === "string" && o.message) return 1;
  return Object.values(o).reduce<number>((n, v) => n + countErrors(v), 0);
}

/**
 * The shared failed-submit voice: a counted toast ("3 isian belum lengkap")
 * and focus + scroll to the FIRST invalid field in document order. RHF's own
 * focus follows registration order, which puts the last card first here.
 */
export function useInvalidHandler() {
  const t = useT();
  return (errors: unknown) => {
    const n = countErrors(errors);
    toast.error(
      n > 0
        ? t("order.formInvalidCount").replace("{n}", String(n))
        : t("order.formInvalidToast"),
    );
    // let the error render land before we look for it
    setTimeout(() => {
      const el = document.querySelector<HTMLElement>(
        'main [aria-invalid="true"]',
      );
      if (el) {
        el.focus({ preventScroll: true });
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 80);
  };
}

/* The module completed on the way back to the hub, so the hub can play its
   one-time completion animation. In-memory on purpose: a page refresh forgets
   it, and the animation only belongs to the moment right after saving. */
let justSaved: ModuleId | null = null;
/* A real save is about to unmount the form; its autosave must not downgrade
   the freshly-saved module back to in-progress. */
let skipAutosave: ModuleId | null = null;
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
    skipAutosave = moduleId;
    saveModule(moduleId, data);
    const meta = getModuleMeta(moduleId);
    toast.success(`${meta ? t(meta.titleKey) : ""} ${t("order.moduleSavedToast")}`.trim());
    justSaved = moduleId;
    router.push("/pesan/modul");
  };
}

/**
 * Leaving a half-typed module keeps the typing: on unmount, dirty values are
 * stored as an in-progress draft (the hub already renders that status), so
 * the back link never silently discards work. Validation still happens only
 * on a real save.
 */
export function useDraftAutosave(
  moduleId: ModuleId,
  getValues: () => Record<string, unknown>,
  isDirty: boolean,
) {
  const saveDraft = useOrderStore((s) => s.saveModuleDraft);
  const ref = React.useRef({ getValues, isDirty, saveDraft });
  React.useEffect(() => {
    ref.current = { getValues, isDirty, saveDraft };
  });
  React.useEffect(
    () => () => {
      if (skipAutosave === moduleId) {
        skipAutosave = null;
        return;
      }
      const { getValues, isDirty, saveDraft } = ref.current;
      if (isDirty) saveDraft(moduleId, getValues());
    },
    [moduleId],
  );
}

/** Read the current draft data for a module (once, for form defaults). */
export function readModuleData(moduleId: ModuleId): Record<string, unknown> {
  return useOrderStore.getState().modules[moduleId].data ?? {};
}

export { Field } from "@/components/shared/forms/Field";
