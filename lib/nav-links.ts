/**
 * The one nav IA, shared by the desktop capsule (AppHeader) and the mobile
 * sheet (MobileNav) so the two can never drift apart.
 */
export const NAV_LINKS = [
  { href: "/articles", key: "nav.article" },
  { href: "/about", key: "nav.about" },
  { href: "/faq", key: "nav.faq" },
  // always last: rightmost on desktop, bottom of the sheet on mobile
  { href: "/expat-relocation", key: "nav.expat", accent: true },
] as const;

/**
 * The capsule's one lime button, per page. Everywhere it opens the rate
 * calculator, except on the expat page, where the calculator is the wrong
 * door: its flows are for Indonesians and send a foreigner straight back
 * here. There it jumps to the page's own quote form.
 */
export function headerCta(pathname: string | null): { href: string; key: string } {
  if (pathname?.startsWith("/expat-relocation")) {
    return { href: "#quote", key: "expat.headerCta" };
  }
  return { href: "/#kalkulator", key: "nav.cekTarif" };
}
