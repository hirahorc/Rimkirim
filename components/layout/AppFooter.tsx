"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { useT } from "@/lib/i18n/LanguageProvider";
import { isBareRoute } from "@/lib/utils/routes";

export function AppFooter() {
  const t = useT();
  const pathname = usePathname();
  // the customer order flow (/pesan/*) has its own focused shell — no footer;
  // legal docs render bare so they can drop into other landing services
  if (pathname.startsWith("/pesan") || isBareRoute(pathname)) return null;
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo height={32} />
            <p className="mt-3 text-sm text-muted">{t("footer.tagline")}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <FooterCol
              title={t("footer.colLayanan")}
              links={[
                [t("footer.linkBfg"), "/#layanan"],
                [t("footer.linkMa"), "/#layanan"],
                [t("nav.expat"), "/expat-relocation"],
                [t("footer.linkHitung"), "/#kalkulator"],
              ]}
            />
            <FooterCol
              title={t("footer.colPerusahaan")}
              links={[
                [t("nav.about"), "/about"],
                [t("footer.linkKenapa"), "/#kenapa"],
                [t("nav.article"), "/articles"],
              ]}
            />
            <FooterCol
              title={t("footer.colBantuan")}
              links={[
                [t("footer.linkWa"), "https://wa.me/6281234567890"],
                [t("footer.linkFaq"), "/faq"],
                [t("footer.linkLacak"), "#"],
              ]}
            />
          </div>
        </div>
        <div className="mt-10 space-y-3 border-t border-border pt-6 text-xs text-muted-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {new Date().getFullYear()} Rimkirim. {t("footer.rights")}
            </span>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="transition-colors hover:text-foreground">
                {t("footer.legalTerms")}
              </Link>
              <Link href="/privacy" className="transition-colors hover:text-foreground">
                {t("footer.legalPrivacy")}
              </Link>
            </div>
          </div>
          <span className="block">{t("footer.disclaimer")}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="mb-3 font-medium text-foreground">{title}</h4>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-muted transition-colors hover:text-brand">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
