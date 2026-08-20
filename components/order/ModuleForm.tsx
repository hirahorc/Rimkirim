"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  useOrderStore,
  isPickupUnlocked,
  type ModuleId,
} from "@/lib/store/useOrderStore";
import { CustomerInfoForm } from "./modules/CustomerInfoForm";
import { ItemsForm } from "./modules/ItemsForm";
import { ComplianceForm } from "./modules/ComplianceForm";
import { PickupForm } from "./modules/PickupForm";

const FORMS: Record<ModuleId, React.ComponentType> = {
  customerInfo: CustomerInfoForm,
  items: ItemsForm,
  compliance: ComplianceForm,
  pickup: PickupForm,
};

export function ModuleForm({ moduleId }: { moduleId: string }) {
  const router = useRouter();
  const modules = useOrderStore((s) => s.modules);
  const valid = moduleId in FORMS;
  // the hub's "Terkunci" is a real gate: a deep link (stale tab, shared URL)
  // goes back to the hub, which explains the lock
  const locked = moduleId === "pickup" && !isPickupUnlocked(modules);

  React.useEffect(() => {
    if (!valid || locked) router.replace("/pesan/modul");
  }, [valid, locked, router]);

  if (!valid || locked) return null;
  const Form = FORMS[moduleId as ModuleId];
  return <Form />;
}
