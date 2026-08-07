import type { Metadata } from "next";
import { OrderList } from "@/components/order/OrderList";

export const metadata: Metadata = {
  title: "Pesanan Saya · Rimkirim",
  description: "Pantau semua kiriman Rimkirim kamu di satu tempat.",
};

export default function PesananPage() {
  return <OrderList />;
}
