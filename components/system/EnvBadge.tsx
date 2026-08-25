import { APP_ENV, IS_PRODUCTION } from "@/lib/env";

/**
 * A discreet non-production marker so nobody mistakes staging (or a local build)
 * for the live site. Info-blue to match the app's existing ops/demo chrome, and
 * `pointer-events-none` so it never sits between the user and a control. Renders
 * nothing in production.
 */
export function EnvBadge() {
  if (IS_PRODUCTION) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-4 left-4 z-50 select-none rounded-full border border-info/25 bg-info/15 px-3 py-1 font-display text-xs font-semibold uppercase tracking-wide text-info shadow-float"
    >
      {APP_ENV}
    </div>
  );
}
