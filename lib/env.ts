/**
 * Runtime environment marker.
 *
 * Driven by `NEXT_PUBLIC_APP_ENV`, which is set **per Vercel environment** in the
 * dashboard (Production → `production`, the staging branch → `staging`). It is a
 * `NEXT_PUBLIC_` var, so its value is inlined at build time and is safe to read
 * on both server and client. Local dev, where the var is unset, reports
 * `development`.
 *
 * There is no backend yet, so this is currently used only for the on-screen
 * staging marker and to keep non-production deployments out of search indexes.
 * When environment-specific config (API base URLs, keys) arrives, branch on
 * `APP_ENV` / `IS_PRODUCTION` here rather than reading `process.env` ad hoc.
 */
export type AppEnv = "production" | "staging" | "development";

export const APP_ENV: AppEnv =
  (process.env.NEXT_PUBLIC_APP_ENV as AppEnv | undefined) ??
  (process.env.NODE_ENV === "development" ? "development" : "production");

export const IS_PRODUCTION = APP_ENV === "production";
export const IS_STAGING = APP_ENV === "staging";

/**
 * Whether the canvas's ways into the prototype ship with this deployment:
 * scene mode (`?scene=`, what the board's "Open live" links to) and the
 * "Prototype | Canvas" switch on the pages it frames. The board itself is
 * kanvas's static site in public/canvas (kanvas.config.ts), served as files.
 *
 * Everywhere, production included. The prototype is a design tool with no
 * backend, so there's nothing in production for the canvas to get in the way
 * of, and whoever is sent the production link sees the same boards (decided
 * 2026-11-24). Its pages stay out of search indexes either way (the board's
 * pages say noindex).
 *
 * The one place to change that: make this `!IS_PRODUCTION` and scene mode
 * and the switch leave production (the layout leaves the script out); to
 * take the board out too, leave public/canvas out of that deployment.
 */
export const HAS_CANVAS: boolean = true;
