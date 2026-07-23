"use client";

import * as React from "react";
import { messages, type Locale } from "./messages";

const STORAGE_KEY = "rimkirim:lang";
const DEFAULT_LOCALE: Locale = "id";

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
  // Start with the default so server and first client render match; the stored
  // preference is applied after mount (brief flash for non-default users only).
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "id" || stored === "en") setLocaleState(stored);
  }, []);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = next;
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
