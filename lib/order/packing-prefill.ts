import { INDONESIA } from "@/lib/data/countries";
import type { OrderContext } from "@/lib/store/useOrderStore";
import type { PackingListData } from "@/lib/types/packing";

/**
 * Map a standalone packing list onto the order's Customer Information and
 * Items & Packages module data. The order form pins one side of the route to
 * Indonesia (receiver for BFG, sender for Moving Abroad), so that side's
 * country follows the order context rather than what the list says.
 */
export function mapPackingToModules(
  data: PackingListData,
  context: OrderContext | null,
): { customerInfo: Record<string, unknown>; items: Record<string, unknown> } {
  const isExport = context?.service === "moving-abroad";
  const sender = { ...data.sender };
  const receiver = { ...data.receiver };
  if (context) {
    if (isExport) sender.country = INDONESIA.code;
    else receiver.country = INDONESIA.code;
  }
  return {
    customerInfo: { sender, receiver },
    items: {
      currency: data.items.currency,
      packages: data.items.packages.map((p) => ({ ...p, photos: p.photos ?? {} })),
    },
  };
}
