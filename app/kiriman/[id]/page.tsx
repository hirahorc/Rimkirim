import type { Metadata } from "next";
import { OrderDetail } from "@/components/order/OrderDetail";

export const metadata: Metadata = {
  title: "Tracking · Rimkirim",
  description: "Pantau status pengiriman kiriman Rimkirim kamu.",
};

export default async function KirimanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetail id={id} />;
}
