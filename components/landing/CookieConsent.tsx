"use client";

import * as React from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * Non-blocking cookie-consent banner (bottom of the landing page).
 * No persistence yet — dismissing only hides it for this session, so it
 * reappears on every reload. (Persist the choice in localStorage here later.)
 */
export function CookieConsent() {
  const t = useT();
  const [visible, setVisible] = React.useState(true);
  if (!visible) return null;

  const dismiss = () => setVisible(false);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4">
      <div className="animate-fade-up pointer-events-auto flex w-full max-w-3xl flex-col gap-3 rounded-lg border border-border bg-surface/95 p-4 shadow-overlay backdrop-blur sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-start gap-2.5 text-sm text-muted">
          <Cookie className="mt-0.5 size-5 shrink-0 text-foreground" />
          <p>{t("cookie.text")}</p>
        </div>
        <div className="flex shrink-0 gap-2 sm:ml-auto">
          <Button variant="secondary" size="sm" onClick={dismiss}>
            {t("cookie.decline")}
          </Button>
          <Button variant="brand" size="sm" onClick={dismiss}>
            {t("cookie.accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
