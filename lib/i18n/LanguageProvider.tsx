"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { messages, type Locale } from "./messages";

const STORAGE_KEY = "rimkirim:lang";
const DEFAULT_LOCALE: Locale = "id";

/**
 * Pages that exist in one language only. They always render in it, whatever
 * the visitor saved elsewhere, and carry no language switch (the expat page
 * speaks to foreigners, so it is English only). Leaving one hands the site
 * back to the visitor's saved choice; with none saved, the language they
 * landed in carries on, so an expat who arrives here and clicks through to
 * the main site keeps reading English.
 */
const ROUTE_ONLY_LOCALE: { prefix: string; locale: Locale }[] = [
  { prefix: "/expat-relocation", locale: "en" },
];

function routeOnlyLocale(pathname: string | null): Locale | null {
  return ROUTE_ONLY_LOCALE.find((r) => pathname?.startsWith(r.prefix))?.locale ?? null;
}

// the saved choice, read as an external store: the server snapshot is null,
// so hydration renders the page's default and the saved language follows
// right after (a brief flash only for users whose choice differs from it)
const subscribeStored = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};
function readStored(): Locale | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "id" || v === "en" ? v : null;
  } catch {
    return null;
  }
}

type Translator = (path: string) => string;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translator;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

function lookup(locale: Locale, path: string): string {
  const parts = path.split(".");
  // resolve against the active locale, then fall back to the default, then the key
  for (const loc of [locale, DEFAULT_LOCALE] as const) {
    let node: unknown = messages[loc];
    let ok = true;
    for (const p of parts) {
      if (node && typeof node === "object" && p in (node as object)) {
        node = (node as Record<string, unknown>)[p];
      } else {
        ok = false;
        break;
      }
    }
    if (ok && typeof node === "string") return node;
  }
  return path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // a one-language page wins outright; elsewhere the visitor's choice, then
  // their saved one, then the language of the page they landed on (taken
  // once, so moving between pages keeps what they are already reading)
  const pathname = usePathname();
  const only = routeOnlyLocale(pathname);
  const [landing] = React.useState<Locale>(() => only ?? DEFAULT_LOCALE);
  const stored = React.useSyncExternalStore(subscribeStored, readStored, () => null);
  const [chosen, setChosen] = React.useState<Locale | null>(null);
  const locale = only ?? chosen ?? stored ?? landing;

  // <html lang> is fixed to "id" by the root layout; keep it truthful for
  // screen readers and translation tools whichever way the locale was set
  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = React.useCallback((next: Locale) => {
    setChosen(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const t = React.useCallback<Translator>((path) => lookup(locale, path), [locale]);

  const value = React.useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

/** Shorthand: returns the translator `t`. */
export function useT(): Translator {
  return useLanguage().t;
}
