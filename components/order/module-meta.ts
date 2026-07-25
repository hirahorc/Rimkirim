import { User, Package, FileCheck2, CalendarClock, type LucideIcon } from "lucide-react";
import type { ModuleId } from "@/lib/store/useOrderStore";

export interface ModuleMeta {
  id: ModuleId;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  /** locked until the other three modules are complete */
  locksUntilOthers?: boolean;
}

export const MODULE_META: ModuleMeta[] = [
  { id: "customerInfo", icon: User, titleKey: "order.modCustomer", descKey: "order.modCustomerDesc" },
  { id: "items", icon: Package, titleKey: "order.modItems", descKey: "order.modItemsDesc" },
  { id: "compliance", icon: FileCheck2, titleKey: "order.modCompliance", descKey: "order.modComplianceDesc" },
  {
    id: "pickup",
    icon: CalendarClock,
    titleKey: "order.modPickup",
    descKey: "order.modPickupDesc",
    locksUntilOthers: true,
  },
];

export function getModuleMeta(id: string): ModuleMeta | undefined {
  return MODULE_META.find((m) => m.id === id);
}
