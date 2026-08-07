import type { Metadata } from "next";
import { LegalDoc } from "@/components/legal/LegalDoc";
import { termsDoc } from "@/components/legal/legal-content";

export const metadata: Metadata = {
  title: "Ketentuan Layanan · Rimkirim",
  description:
    "Ketentuan Layanan Rimkirim: cakupan layanan pengiriman & relokasi internasional, estimasi tarif, bea cukai, dan tanggung jawab pengguna.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <LegalDoc doc={termsDoc} />;
}
