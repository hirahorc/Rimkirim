import type { Metadata } from "next";
import { PackingListForm } from "@/components/packing/PackingListForm";

export const metadata: Metadata = {
  title: "Buat Packing List · Rimkirim",
  description: "Isi pengirim, penerima, dan isi paket — kami buatkan kode dan PDF-nya.",
};

export default function PackingListCreatePage() {
  return <PackingListForm />;
}
