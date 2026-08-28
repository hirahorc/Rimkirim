"use client";

import { useRouter } from "next/navigation";
import { useOrderStore } from "@/lib/store/useOrderStore";

/** Open an order: drafts resume in the order form, submitted ones open tracking. */
export function useOpenOrder() {
  const router = useRouter();
  const resumeOrder = useOrderStore((s) => s.resumeOrder);
  return (o: { orderId: string; bookingNumber: string | null; draft: boolean }) => {
    if (o.draft) {
      resumeOrder(o.orderId);
      router.push(o.bookingNumber ? "/pesan/modul" : "/pesan");
    } else {
      router.push(`/kiriman/${o.orderId}`);
    }
  };
}
