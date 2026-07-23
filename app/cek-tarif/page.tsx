import type { Metadata } from "next";
import { CheckRatesClient } from "@/components/rates/CheckRatesClient";

export const metadata: Metadata = {
  title: "Cek Tarif — Rimkirim",
  description: "Estimasi tarif pengiriman internasional Rimkirim.",
};

export default function CekTarifPage() {
  return <CheckRatesClient />;
}
