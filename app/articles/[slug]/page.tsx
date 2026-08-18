import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllArticles, getArticle, getArticleMeta, getRelated } from "@/lib/articles";
import { messages } from "@/lib/i18n/messages";
import { ArticleHeader } from "@/components/articles/ArticleHeader";
import { ArticleCover } from "@/components/articles/ArticleCover";
import { ArticleBody } from "@/components/articles/ArticleBody";
import { ArticleFaq } from "@/components/articles/ArticleFaq";
import { ArticleToc } from "@/components/articles/ArticleToc";
import { ArticleCta } from "@/components/articles/ArticleCta";
import { ArticleLocaleSync } from "@/components/articles/ArticleLocaleSync";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
import { slugifyHeading } from "@/lib/articles/shared";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticleMeta(slug);
  if (!a) return {};
  const pair = getArticleMeta(a.pair);
  const languages: Record<string, string> = { [a.lang]: `/articles/${a.slug}` };
  if (pair) languages[pair.lang] = `/articles/${pair.slug}`;
  return {
    title: `${a.metaTitle} · Rimkirim`,
    description: a.description,
    keywords: a.keyword,
    alternates: { canonical: `/articles/${a.slug}`, languages },
    openGraph: {
      title: a.metaTitle,
      description: a.description,
      type: "article",
      publishedTime: a.date,
      locale: a.lang === "en" ? "en_GB" : "id_ID",
      images: a.hasCover ? [{ url: a.cover }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const m = messages[article.lang].article;
  const faqId = slugifyHeading(article.faq.length ? article.toc.find((t) => /pertanyaan|frequently/i.test(t.text))?.text ?? m.faq : m.faq);
  const related = getRelated(article, 3);

  return (
    <article lang={article.lang}>
      <ArticleLocaleSync lang={article.lang} pairSlug={article.pair} />

      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <ArticleHeader article={article} />
        <ArticleCover
          article={article}
          sizes="(min-width: 1152px) 1152px, 100vw"
          priority
          missingLabel={m.coverMissing}
          className="mt-8 rounded-lg sm:mt-10 sm:aspect-[21/9]"
        />
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
        <div className="min-w-0 max-w-[68ch] text-base">
          <div className="lg:hidden">
            <ArticleToc variant="inline" items={article.toc} label={m.toc} />
          </div>
          <div className="mt-8 lg:mt-0">
            <ArticleBody markdown={article.body} />
          </div>
          <ArticleFaq id={faqId} title={m.faq} items={article.faq} />
          {article.after && (
            <div>
              <ArticleBody markdown={article.after} />
            </div>
          )}
          <ArticleCta />
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <ArticleToc variant="rail" items={article.toc} label={m.toc} />
          </div>
        </aside>
      </div>

      <RelatedArticles items={related} />
    </article>
  );
}
