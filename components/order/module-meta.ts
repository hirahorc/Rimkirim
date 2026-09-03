import type * as React from "react";
import {
  UserIcon,
  CubeIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";
import type { ModuleId } from "@/lib/store/useOrderStore";

export interface ModuleMeta {
  id: ModuleId;
  /** solid glyph: the hub tiles are anchors, not diagrams */
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  titleKey: string;
  descKey: string;
  /** locked until the other three modules are complete */
  locksUntilOthers?: boolean;
}

export const MODULE_META: ModuleMeta[] = [
  { id: "customerInfo", icon: UserIcon, titleKey: "order.modCustomer", descKey: "order.modCustomerDesc" },
  { id: "items", icon: CubeIcon, titleKey: "order.modItems", descKey: "order.modItemsDesc" },
  { id: "compliance", icon: ClipboardDocumentCheckIcon, titleKey: "order.modCompliance", descKey: "order.modComplianceDesc" },
  {
    id: "pickup",
    icon: CalendarDaysIcon,
    titleKey: "order.modPickup",
    descKey: "order.modPickupDesc",
    locksUntilOthers: true,
  },
];

export function getModuleMeta(id: string): ModuleMeta | undefined {
  return MODULE_META.find((m) => m.id === id);
}
