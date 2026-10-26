"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { SocialLinks } from "./SocialLinks";
import { useT } from "@/lib/i18n/LanguageProvider";
import { WA_URL } from "@/lib/contact";

const EMAIL = "hello@rimkirim.com";

/**
 * The expat landing's footer: how to reach a person, and the one door back
 * to the main Rimkirim site, its two services. No account links and no site
 * map, so a visitor who came for a quote is never sent into flows built for
 * Indonesian customers. The language switch lives here too, because on
 * phones the bar has no room for it.
 */
export function ExpatFooter() {
  const t = useT();
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))]">
          <div className="max-w-xs">
            <Logo href="/expat-relocation" ariaLabel={t("expat.headerHome")} height={32} />
            <p className="mt-3 text-sm text-muted">{t("expat.footer.tagline")}</p>
            <div className="mt-5">
              <LanguageToggle />
            </div>
          </div>

          <div className="text-sm">
            <h3 className="mb-3 font-medium text-foreground">{t("expat.footer.contacts")}</h3>
            <ul>
              <li>
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="tap-row flex items-center py-1.5 text-muted transition-colors hover:text-foreground"
                >
                  {t("footer.linkWa")}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="tap-row flex items-center py-1.5 text-muted transition-colors hover:text-foreground"
                >
                  {EMAIL}
                </a>
              </li>
            </ul>
            <address className="mt-2 text-sm not-italic leading-relaxed text-muted-2">
              {t("footer.address")}
            </address>
          </div>

          {/* the way back to the main site: its two services */}
          <FooterLinks
            title={t("footer.colLayanan")}
            links={[
              [t("footer.linkBfg"), "/#layanan"],
              [t("footer.linkMa"), "/#layanan"],
            ]}
          />

          <FooterLinks
            title={t("expat.footer.legal")}
            links={[
              [t("footer.legalTerms"), "/terms"],
              [t("footer.legalPrivacy"), "/privacy"],
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-muted-2">
            © {new Date().getFullYear()} Rimkirim. {t("footer.rights")}
          </span>
          <SocialLinks label={t("footer.social")} className="-ml-2.5 sm:ml-0 sm:-mr-2.5" />
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="text-sm">
      <h3 className="mb-3 font-medium text-foreground">{title}</h3>
      <ul>
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="tap-row flex items-center py-1.5 text-muted transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
