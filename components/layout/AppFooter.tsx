"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { useT } from "@/lib/i18n/LanguageProvider";
import { isBareRoute, isOrderFlowRoute } from "@/lib/utils/routes";
import { WA_URL } from "@/lib/contact";

export function AppFooter() {
  const t = useT();
  const pathname = usePathname();
  // the customer order flow (/pesan/*) has its own focused shell — no footer;
  // legal docs render bare so they can drop into other landing services
  if (isOrderFlowRoute(pathname) || isBareRoute(pathname)) return null;
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo height={32} />
            <p className="mt-3 text-sm text-muted">{t("footer.tagline")}</p>
            <address className="mt-4 text-sm not-italic leading-relaxed text-muted-2">
              {t("footer.address")}
            </address>
            <SocialLinks label={t("footer.social")} className="-ml-2.5 mt-5" />
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <FooterCol
              title={t("footer.colLayanan")}
              links={[
                [t("footer.linkBfg"), "/#layanan"],
                [t("footer.linkMa"), "/#layanan"],
                [t("nav.expat"), "/expat-relocation"],
                [t("footer.linkHitung"), "/#kalkulator"],
                [t("footer.linkPackingList"), "/packing-list/buat"],
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
                [t("footer.linkWa"), WA_URL],
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
              <Link href="/terms" className="py-1 transition-colors hover:text-foreground">
                {t("footer.legalTerms")}
              </Link>
              <Link href="/privacy" className="py-1 transition-colors hover:text-foreground">
                {t("footer.legalPrivacy")}
              </Link>
            </div>
          </div>
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
      <h3 className="mb-3 font-medium text-foreground">{title}</h3>
      <ul>
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="flex items-center py-1.5 text-muted transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
