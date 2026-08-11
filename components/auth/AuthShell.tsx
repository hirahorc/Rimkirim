"use client";

import * as React from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";

/**
 * Shared shell for the mock login/signup pages: a centred card with title +
 * subtitle + form, a demo-mode note, and a switch link between the two.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  switchHref,
  switchPre,
  switchLabel,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  switchHref: string;
  switchPre: string;
  switchLabel: string;
}) {
  const t = useT();
  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <Card className="p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </Card>
      <p className="mt-4 text-center text-xs text-muted-2">{t("auth.demoNote")}</p>
      <p className="mt-6 text-center text-sm text-muted">
        {switchPre}{" "}
        <Link href={switchHref} className="link-mark">
          {switchLabel}
        </Link>
      </p>
    </div>
  );
}
