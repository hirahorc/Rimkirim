import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  type ArticleMeta,
  type ArticleLang,
  type ArticleCategory,
  type TocItem,
  type FaqItem,
  slugifyHeading,
  isFaqHeading,
} from "./shared";

export * from "./shared";

const CONTENT_DIR = path.join(process.cwd(), "content", "articles");
const PUBLIC_DIR = path.join(process.cwd(), "public");

export interface Article extends ArticleMeta {
  /** markdown body BEFORE the FAQ section (or the whole body if none) */
  body: string;
  /** markdown after the FAQ section (usually the closing CTA / summary) */
  after: string;
  toc: TocItem[];
  faq: FaqItem[];
}

const WORDS_PER_MINUTE = 200;

function readingMinutes(md: string): number {
  const words = md
    .replace(/[#*_>|`\-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function toMeta(slug: string, data: Record<string, unknown>, md: string): ArticleMeta {
  const cover = String(data.cover ?? `/articles/${slug}.jpg`);
  return {
    slug,
    title: String(data.title ?? slug),
    metaTitle: String(data.metaTitle ?? data.title ?? slug),
    description: String(data.description ?? ""),
    keyword: String(data.keyword ?? ""),
    category: (data.category as ArticleCategory) ?? "guides",
    lang: (data.lang as ArticleLang) ?? "id",
    pair: String(data.pair ?? ""),
    date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? ""),
    cover,
    hasCover: fs.existsSync(path.join(PUBLIC_DIR, cover)),
    readingMinutes: readingMinutes(md),
  };
}

let cache: { metas: ArticleMeta[]; raw: Map<string, string> } | null = null;

function load() {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  const metas: ArticleMeta[] = [];
  const raw = new Map<string, string>();
  for (const f of files) {
    const slug = f.replace(/\.md$/, "");
    const { data, content } = matter(fs.readFileSync(path.join(CONTENT_DIR, f), "utf8"));
    metas.push(toMeta(slug, data, content));
    raw.set(slug, content);
  }
  metas.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  cache = { metas, raw };
  return cache;
}

export function getAllArticles(): ArticleMeta[] {
  return load().metas;
}

export function getArticlesByLang(lang: ArticleLang): ArticleMeta[] {
  return load().metas.filter((m) => m.lang === lang);
}

export function getArticleMeta(slug: string): ArticleMeta | null {
  return load().metas.find((m) => m.slug === slug) ?? null;
}

/**
 * Split the markdown into: h2 table of contents, the body up to the FAQ
 * section, the FAQ pairs (`**Question?** answer` paragraphs), and whatever
 * follows the FAQ section (closing CTA / summary).
 */
function parse(md: string) {
  const lines = md.split("\n");
  const toc: TocItem[] = [];
  let faqStart = -1;
  let faqEnd = lines.length;
  lines.forEach((line, i) => {
    const m = /^## (.+)$/.exec(line);
    if (!m) return;
    const text = m[1].trim();
    if (isFaqHeading(text)) {
      faqStart = i;
    } else if (faqStart >= 0 && faqEnd === lines.length) {
      faqEnd = i;
    }
    toc.push({ id: slugifyHeading(text), text });
  });

  if (faqStart < 0) return { toc, body: md, after: "", faq: [] as FaqItem[] };

  const body = lines.slice(0, faqStart).join("\n").trimEnd();
  const faqBlock = lines.slice(faqStart + 1, faqEnd).join("\n");
  const after = lines.slice(faqEnd).join("\n").trim();
  const faq: FaqItem[] = [];
  for (const para of faqBlock.split(/\n\s*\n/)) {
    const m = /^\*\*(.+?)\*\*\s*([\s\S]*)$/.exec(para.trim());
    if (m) faq.push({ q: m[1].trim(), a: m[2].trim() });
  }
  return { toc, body, after, faq };
}

export function getArticle(slug: string): Article | null {
  const { metas, raw } = load();
  const meta = metas.find((m) => m.slug === slug);
  const md = raw.get(slug);
  if (!meta || md === undefined) return null;
  return { ...meta, ...parse(md) };
}

/** Same-language articles, same category first, newest first, excluding self. */
export function getRelated(meta: ArticleMeta, n = 3): ArticleMeta[] {
  const same = getArticlesByLang(meta.lang).filter((m) => m.slug !== meta.slug);
  return [
    ...same.filter((m) => m.category === meta.category),
    ...same.filter((m) => m.category !== meta.category),
  ].slice(0, n);
}
