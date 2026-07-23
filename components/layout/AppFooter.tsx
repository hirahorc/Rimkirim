"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { useT } from "@/lib/i18n/LanguageProvider";

export function AppFooter() {
  const t = useT();
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
                [t("footer.linkHitung"), "/#kalkulator"],
              ]}
            />
            <FooterCol
              title={t("footer.colPerusahaan")}
              links={[
                [t("footer.linkKenapa"), "/#kenapa"],
                [t("footer.linkTestimoni"), "/#kenapa"],
                [t("footer.linkBlog"), "#"],
              ]}
            />
            <FooterCol
              title={t("footer.colBantuan")}
              links={[
                [t("footer.linkWa"), "https://wa.me/6281234567890"],
                [t("footer.linkFaq"), "#"],
                [t("footer.linkLacak"), "#"],
              ]}
            />
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-2 sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} Rimkirim. {t("footer.rights")}
          </span>
          <span>{t("footer.disclaimer")}</span>
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
