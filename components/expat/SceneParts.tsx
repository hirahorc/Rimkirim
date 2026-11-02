"use client";

import * as React from "react";
import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * The small pieces every illustration on the expat page is built from (the
 * journey's scenes and the section scenes alike), so they read as one
 * figure language: one filler line, one flag, one title, one parcel, one
 * chat card. Sizes are in em, a share of the stage's width.
 */

/** when a piece starts, in ms after its scene comes up */
export const at = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

/** filler: the product's quiet lines where words would not help */
export function Bar({ w, className }: { w: string; className?: string }) {
  return <span className={cn("block h-[0.5em] shrink-0 rounded-full bg-surface-3", className)} style={{ width: w }} />;
}

/** a flat flag, sized in em so it scales with the scene, with a hairline so
 *  a white field (Indonesia's lower half) keeps its edge on a white card */
export function SceneFlag({ code }: { code: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny static SVG, as in Flag
    <img src={`/flags/4x3/${code}.svg`} alt="" className="h-[0.8em] w-[1.07em] shrink-0 object-cover ring-1 ring-foreground/10" />
  );
}

export function SceneTitle({ children }: { children: React.ReactNode }) {
  return <span className="font-display text-[1.05em] font-semibold tracking-tight">{children}</span>;
}

/**
 * A parcel in three-quarter view: kraft board (its one colour outside the
 * palette, because a cardboard box is the brown of cardboard), each face
 * its own tone, the tape over the lid and down the front, the shipping
 * label, and the contact shadow it sits on. It lands when it comes in.
 */
export function Parcel({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <span className={cn("jr jr-land absolute block", className)} style={style}>
      <svg viewBox="0 0 38 33" className="block size-full overflow-visible" aria-hidden>
        <ellipse cx="18" cy="32.4" rx="20" ry="1.6" fill="#000" opacity="0.12" />
        <path d="M0 10 L10 3.5 H38 L28 10 Z" fill="#ebc99c" />
        <path d="M28 10 L38 3.5 V25.5 L28 32 Z" fill="#c08954" />
        <rect x="0" y="10" width="28" height="22" fill="#d8a76e" />
        {/* the lid's fold, catching the light */}
        <path d="M0 10 H28 L38 3.5" fill="none" stroke="#f6dcb6" strokeWidth="0.5" />
        {/* tape: over the lid, then down the front */}
        <path d="M12.6 10 L22.6 3.5 H25.4 L15.4 10 Z" fill="#c9965c" opacity="0.9" />
        <rect x="12.6" y="10" width="2.8" height="8" fill="#c9965c" opacity="0.9" />
        {/* the label, with its barcode */}
        <rect x="16.8" y="17.6" width="9" height="11" rx="0.6" fill="#fff" />
        <rect x="18" y="19.2" width="6.6" height="1.1" rx="0.3" className="fill-muted-2" />
        {[0, 1.1, 1.8, 3, 3.7, 4.9, 5.7].map((x) => (
          <rect key={x} x={18 + x} y="21.7" width="0.55" height="5" className="fill-foreground" />
        ))}
      </svg>
    </span>
  );
}

/** the chat's header, as WhatsApp shows a business: its picture (Rimkirim's
 *  own app icon, the brand's mark, not a "press this"), its name, the app */
export function ChatHead({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-[0.55em] border-b border-border px-[1em] py-[0.75em]", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a 96px still, as in SceneFlag */}
      <img src="/expat/journey/rimkirim-avatar.png" alt="" className="size-[1.75em] shrink-0 rounded-full" />
      <span className="min-w-0">
        <span className="block truncate text-[0.82em] font-semibold leading-tight">Rimkirim</span>
        <span className="block truncate text-[0.66em] leading-tight text-muted-2">WhatsApp</span>
      </span>
    </div>
  );
}

/** one message: theirs on the panel at the left, the customer's in the
 *  chapter's ink at the right with WhatsApp's read ticks, each kept a step
 *  from the other side so a long one never reads as from both; each lands
 *  from just above at its start */
export function Bubble({
  from,
  ms,
  className,
  children,
}: {
  from: "them" | "me";
  ms: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "jr jr-drop w-fit text-pretty rounded-[0.9em] px-[0.75em] py-[0.5em] text-[0.78em] leading-snug",
        from === "them"
          ? "mr-[1.5em] self-start rounded-tl-[0.25em] bg-surface-2"
          : "ml-[1.5em] self-end rounded-tr-[0.25em] bg-tone-ink text-background",
        className,
      )}
      style={at(ms)}
    >
      {children}
      {from === "me" && <CheckCheck className="ml-[0.3em] inline size-[1.05em] align-[-0.2em] opacity-75" strokeWidth={2.25} />}
    </div>
  );
}
