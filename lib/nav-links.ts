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
