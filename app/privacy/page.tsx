import type { Metadata } from "next";
import { LegalDoc } from "@/components/legal/LegalDoc";
import { privacyDoc } from "@/components/legal/legal-content";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — Rimkirim",
  description:
    "Kebijakan Privasi Rimkirim: data yang kami kumpulkan, cara penggunaannya, berbagi data dengan mitra carrier & bea cukai, dan hak kamu.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalDoc doc={privacyDoc} />;
}
