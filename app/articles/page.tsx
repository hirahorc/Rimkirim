import type { Metadata } from "next";
import { getAllArticles } from "@/lib/articles";
import { ArticlesIndex } from "@/components/articles/ArticlesIndex";

export const metadata: Metadata = {
  title: "Article · Rimkirim",
  description:
    "Panduan bea cukai, biaya, dan persiapan pindah lintas negara dari Rimkirim, tersedia dalam Bahasa Indonesia & English.",
  alternates: { canonical: "/articles" },
};

export default function ArticlesPage() {
  return <ArticlesIndex articles={getAllArticles()} />;
}
