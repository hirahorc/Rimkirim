"use client";

import type * as React from "react";
import { WA_URL, waLink } from "@/lib/contact";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/**
 * The landing's one way to ask a person, wherever a section leaves a
 * question open (Before you send, customs, the FAQ): the question in the
 * section's quiet ink, then the link, which says the same thing everywhere
 * ("Ask us on WhatsApp"), so the reader learns it once. Built from one type
 * size and two weights, and the tokens the page already has (DESIGN.md, The
 * ask):
 *   14/20 400  the question, --muted (re-pointed by the chapter)
 *   14/20 500  the link, .link-mark (the page's link blue, underlined)
 * No icon: it sits in a sentence, as every other inline link on the page
 * does, and an icon there floated off the line and, on a phone, wrapped to
 * the start of the next one like a bullet. The link never breaks inside
 * itself, so a long question carries it whole onto the next line.
 * Where it sits is the caller's: 16 under the rule that closes what it's
 * about, or 24 under a heading.
 */
export function AskLine({
  question,
  message,
  className,
  style,
}: {
  question: string;
  message?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const t = useT();
  return (
    <p className={cn("text-sm text-muted", className)} style={style}>
      {question}{" "}
      {/* the message arrives already asking, so the team starts where the
          visitor is */}
      <a
        href={message ? waLink(message) : WA_URL}
        target="_blank"
        rel="noreferrer"
        className="link-mark tap-row relative whitespace-nowrap"
      >
        {t("expat.ask.cta")}
      </a>
    </p>
  );
}
