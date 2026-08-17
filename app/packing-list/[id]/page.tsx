import type { Metadata } from "next";
import { PackingListForm } from "@/components/packing/PackingListForm";

export const metadata: Metadata = {
  title: "Ubah Packing List · Rimkirim",
  description: "Perbarui packing list dan unduh ulang PDF-nya.",
};

export default async function PackingListEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PackingListForm id={id} />;
}
