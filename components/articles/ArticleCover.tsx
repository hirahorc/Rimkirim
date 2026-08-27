import Image from "next/image";
import type { ArticleMeta } from "@/lib/articles/shared";
import { CoverPlaceholder } from "./CoverPlaceholder";
import { cn } from "@/lib/utils/cn";

/** Real cover when it exists in /public, otherwise the placeholder. */
export function ArticleCover({
  article,
  sizes,
  priority,
  className,
  missingLabel,
}: {
  article: Pick<ArticleMeta, "slug" | "title" | "cover" | "hasCover">;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** dev-only badge text when the cover file is missing */
  missingLabel?: string;
}) {
  return (
    <div className={cn("relative aspect-[16/9] overflow-hidden bg-surface-3", className)}>
      {article.hasCover ? (
        <Image
          src={article.cover}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <>
          <CoverPlaceholder slug={article.slug} title={article.title} />
          {missingLabel && process.env.NODE_ENV !== "production" && (
            <span className="absolute left-3 top-3 rounded-full border border-warning/40 bg-background/90 px-2 py-0.5 font-display text-[10px] font-medium uppercase tracking-wide text-warning-ink">
              {missingLabel}
            </span>
          )}
        </>
      )}
    </div>
  );
}
