import type { Metadata } from "next";
import { ComingSoon } from "@/components/marketing/ComingSoon";

export const metadata: Metadata = {
  title: "About Us — Rimkirim",
  description:
    "Rimkirim — pendamping pindahmu lintas negara: harga jelas di depan, bea cukai kami yang urus.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <ComingSoon
      icon="about"
      eyebrowKey="about.eyebrow"
      titleKey="about.title"
      bodyKey="about.body"
    />
  );
}
