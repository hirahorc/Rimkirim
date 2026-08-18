import * as React from "react";
import Link from "next/link";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugifyHeading } from "@/lib/articles/shared";

function textOf(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : textOf((c as React.ReactElement<{ children?: React.ReactNode }>).props?.children)))
    .join("");
}

/**
 * The article prose, styled to the system: display headings with anchors,
 * ≤68ch measure, hairline tables that scroll on narrow screens, callout
 * blockquotes on a soft panel, internal links through next/link.
 */
const components: Components = {
  h2: ({ children }) => {
    const id = slugifyHeading(textOf(children));
    return (
      <h2 id={id} className="mt-12 scroll-mt-28 font-display text-2xl font-bold tracking-tight first:mt-0">
        {children}
      </h2>
    );
  },
  h3: ({ children }) => (
    <h3 className="mt-8 scroll-mt-28 font-display text-lg font-semibold tracking-tight">{children}</h3>
  ),
  p: ({ children }) => <p className="mt-4 leading-relaxed text-muted">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => {
    const h = href ?? "#";
    const internal = h.startsWith("/");
    return internal ? (
      <Link href={h} className="link-mark">
        {children}
      </Link>
    ) : (
      <a href={h} className="link-mark" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  ul: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-5 text-muted marker:text-muted-2">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted marker:font-medium marker:text-foreground">{children}</ol>,
  li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mt-6 rounded-md border border-border bg-surface-2 px-5 py-4 text-sm leading-relaxed text-foreground [&_p]:mt-0 [&_p]:text-foreground">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-surface-2 px-4 py-3 font-mono text-sm text-foreground">
      {children}
    </pre>
  ),
  code: ({ children }) => <code className="font-mono text-[0.9em]">{children}</code>,
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted-2">{children}</thead>,
  th: ({ children }) => <th className="border-b border-border px-4 py-2.5 font-medium">{children}</th>,
  td: ({ children }) => <td className="border-b border-border px-4 py-3 align-top leading-relaxed text-muted [tr:last-child_&]:border-b-0">{children}</td>,
  hr: () => <hr className="my-10 border-border" />,
};

export function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={components}>
      {markdown}
    </Markdown>
  );
}
