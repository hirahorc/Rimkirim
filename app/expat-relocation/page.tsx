import type { Metadata } from "next";
import { ComingSoon } from "@/components/marketing/ComingSoon";

export const metadata: Metadata = {
  title: "Expat Relocation · Rimkirim",
  description:
    "Layanan relokasi Rimkirim untuk warga negara asing & expat yang pindah ke Indonesia · barang, dokumen, dan clearance satu pintu.",
  alternates: { canonical: "/expat-relocation" },
};

export default function ExpatRelocationPage() {
  return (
    <ComingSoon
      icon="expat"
      eyebrowKey="expat.eyebrow"
      titleKey="expat.title"
      bodyKey="expat.body"
    />
  );
}
