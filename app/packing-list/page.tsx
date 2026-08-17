import type { Metadata } from "next";
import { PackingLists } from "@/components/packing/PackingLists";

export const metadata: Metadata = {
  title: "Packing List Saya · Rimkirim",
  description: "Buat dan kelola Commercial Invoice / Packing List kirimanmu.",
};

export default function PackingListPage() {
  return <PackingLists />;
}
