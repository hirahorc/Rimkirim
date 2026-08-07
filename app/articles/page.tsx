import type { Metadata } from "next";
import { ComingSoon } from "@/components/marketing/ComingSoon";

export const metadata: Metadata = {
  title: "Article · Rimkirim",
  description:
    "Cerita, panduan, dan kabar seputar pindah lintas negara dari Rimkirim.",
  alternates: { canonical: "/articles" },
};

export default function ArticlesPage() {
  return (
    <ComingSoon
      icon="article"
      eyebrowKey="article.eyebrow"
      titleKey="article.title"
      bodyKey="article.body"
    />
  );
}
