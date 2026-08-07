import type { Metadata } from "next";
import { Faq } from "@/components/faq/Faq";

export const metadata: Metadata = {
  title: "FAQ — Rimkirim",
  description:
    "Pertanyaan yang sering ditanya soal Back For Good & Moving Abroad — packing, bea cukai, biaya, tracking, dan klaim.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return <Faq />;
}
