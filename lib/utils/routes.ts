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

/**
 * The order-creation flow (`/pesan`, `/pesan/clearance`, `/pesan/modul/...`),
 * which drops the footer to keep the form focused.
 *
 * Must match the segment, not the prefix: a bare `startsWith("/pesan")` also
 * swallows any sibling route sharing the prefix (it once matched the old
 * "/pesanan" tracking pages) — which is exactly the bug this replaces.
 */
export function isOrderFlowRoute(pathname: string): boolean {
  return pathname === "/pesan" || pathname.startsWith("/pesan/");
}
