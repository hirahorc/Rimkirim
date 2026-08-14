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
