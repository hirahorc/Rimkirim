import type { Metadata } from "next";
import { ShipmentList } from "@/components/order/ShipmentList";

export const metadata: Metadata = {
  title: "Kiriman Saya · Rimkirim",
  description: "Pantau semua kiriman Rimkirim kamu di satu tempat.",
};

export default function KirimanPage() {
  return <ShipmentList />;
}
