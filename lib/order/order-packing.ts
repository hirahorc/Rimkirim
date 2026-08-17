import {
  effectivePackingCode,
  type Order,
} from "@/lib/store/useOrderStore";
import type { ItemsData, PackingList, Party } from "@/lib/types/packing";

/**
 * The packing list an order carries, derived from its Customer Information +
 * Items modules. Null until the order has a packing code and both modules hold
 * data. Read-only by nature: editing happens in the order form.
 */
export function packingListFromOrder(order: Order): PackingList | null {
  const code = effectivePackingCode(order);
  const ci = order.modules.customerInfo.data as { sender?: Party; receiver?: Party } | undefined;
  const items = order.modules.items.data as ItemsData | undefined;
  if (!code || !ci?.sender || !ci.receiver || !items?.packages?.length) return null;
  if (order.modules.items.status !== "complete") return null;
  const pickup = order.modules.pickup.data as { date?: string } | undefined;
  return {
    id: `order:${order.id}`,
    code,
    ownerEmail: order.ownerEmail ?? "",
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    data: {
      sender: ci.sender,
      receiver: ci.receiver,
      shippingDate: pickup?.date ?? "",
      // DRAFT: both services move personal effects — the owner will confirm
      purpose: "household",
      items,
    },
    source: { orderId: order.id, bookingNumber: order.bookingNumber },
  };
}
