"use client";

import * as React from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * Non-blocking cookie-consent notice.
 *
 * It waits for the rate calculator to scroll past before it appears: the landing
 * page exists to get someone into that calculator, and a bottom-anchored banner
 * that covers it on first paint costs more than the notice is worth. On a page
 * without the calculator it shows straight away.
 *
 * No persistence yet — dismissing only hides it for this session, so it
 * reappears on every reload. (Persist the choice in localStorage here later.)
 */
export function CookieConsent() {
  const t = useT();
  const [visible, setVisible] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    const calculator = document.getElementById("kalkulator");
    if (!calculator) {
      // next frame rather than synchronously: a setState in the effect body
      // cascades a second render before paint for no benefit
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        // fully above the viewport = the customer has passed the calculator
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0 },
    );
    io.observe(calculator);
    return () => io.disconnect();
  }, []);

  if (!visible || dismissed) return null;

  const dismiss = () => setDismissed(true);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end p-4">
      {/* a corner card, not a full-width bar: the page stays usable beside it */}
      <div className="animate-fade-up pointer-events-auto flex w-full max-w-sm flex-col gap-3 rounded-md border border-border bg-surface/95 p-4 shadow-overlay backdrop-blur">
        <div className="flex items-start gap-2.5 text-sm text-muted">
          <Cookie className="mt-0.5 size-5 shrink-0 text-foreground" />
          <p>{t("cookie.text")}</p>
        </div>
        {/* consent is not the page's primary action, so it never spends lime —
            hierarchy comes from secondary over ghost instead */}
        <div className="flex shrink-0 justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={dismiss}>
            {t("cookie.decline")}
          </Button>
          <Button variant="secondary" size="sm" onClick={dismiss}>
            {t("cookie.accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
