/** Client-safe helpers and types for the article system (no fs here). */

export type ArticleLang = "id" | "en";
export type ArticleCategory = "guides" | "fees" | "country";

export const ARTICLE_CATEGORIES: ArticleCategory[] = ["guides", "fees", "country"];

export interface ArticleMeta {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  keyword: string;
  category: ArticleCategory;
  lang: ArticleLang;
  /** slug of the same article in the other language */
  pair: string;
  /** ISO date */
  date: string;
  /** public path, e.g. /articles/foo.jpg */
  cover: string;
  /** whether the cover file exists in /public (resolved at build/request time) */
  hasCover: boolean;
  readingMinutes: number;
}

export interface TocItem {
  id: string;
  text: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

/** Heading text → stable DOM id (shared by the TOC and the renderer). */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const FAQ_HEADING = /^(pertanyaan yang sering diajukan|frequently asked questions)$/i;

export function isFaqHeading(text: string): boolean {
  return FAQ_HEADING.test(text.trim());
}
