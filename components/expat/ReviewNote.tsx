"use client";

import * as React from "react";
import { ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// the query string never changes under a mounted page, so there is nothing
// to subscribe to; the server snapshot keeps notes out of the static HTML
const subscribe = () => () => {};
const readReviewMode = () => new URLSearchParams(window.location.search).has("review");

/** True on `?review=1`: the draft shows what Rimkirim still has to confirm. */
export function useReviewMode() {
  return React.useSyncExternalStore(subscribe, readReviewMode, () => false);
}

/**
 * A draft annotation for the people signing the page off, not for visitors:
 * invisible unless the URL carries `?review=1`. Written in Indonesian, the
 * team's language, whatever the page locale.
 */
export function ReviewNote({ note, className }: { note: string; className?: string }) {
  const on = useReviewMode();
  if (!on) return null;
  return (
    <aside
      role="note"
      className={cn(
        "flex items-start gap-2.5 rounded-md bg-warning/10 px-4 py-3 text-sm leading-relaxed text-warning-ink",
        className,
      )}
    >
      <ClipboardCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-warning" />
      <p>
        <span className="font-display font-medium">Perlu konfirmasi · </span>
        {note}
      </p>
    </aside>
  );
}
