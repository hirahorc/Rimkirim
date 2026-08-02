/**
 * Standalone pages that must render WITHOUT the app header/footer, so they can
 * be embedded under other Rimkirim landing services that have their own navbar
 * (e.g. the legal documents).
 */
const BARE_ROUTE_PREFIXES = ["/terms", "/privacy"];

export function isBareRoute(pathname: string): boolean {
  return BARE_ROUTE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
