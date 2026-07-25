"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ModuleId } from "@/lib/store/useOrderStore";
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
  const valid = moduleId in FORMS;

  React.useEffect(() => {
    if (!valid) router.replace("/pesan/modul");
  }, [valid, router]);

  if (!valid) return null;
  const Form = FORMS[moduleId as ModuleId];
  return <Form />;
}
