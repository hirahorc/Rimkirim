"use client";

import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthProvider = "email" | "google";

export interface AuthUser {
  email: string;
  name: string;
  provider: AuthProvider;
}

/** In-memory one-time-code challenge for the passwordless email flow. */
interface PendingCode {
  email: string;
  code: string;
  /** set once the code has been verified, so the name step can complete signup */
  verified: boolean;
}

/**
 * Mock auth — NOT real security. Passwordless: an email receives a 6-digit
 * code (here: generated locally and surfaced via toast/console), or the
 * visitor picks a Google account (here: a fake account chooser). Accounts and
 * the session live in localStorage purely so the demo survives reloads and
 * can be gated. A real backend replaces this store wholesale later.
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

interface AuthState {
  users: Record<string, AuthUser>;
  currentEmail: string | null;
  pending: PendingCode | null;

  /** Step 1: issue a code for this email. Returns the code (mock delivery). */
  requestCode: (email: string) => string;
  /**
   * Step 2: check the code. "ok" → signed in (existing account);
   * "new" → code valid but no account yet, call completeSignup(name);
   * "invalid" → wrong code.
   */
  verifyCode: (code: string) => "ok" | "new" | "invalid";
  /** Step 3 (new emails only): create the account with a display name. */
  completeSignup: (name: string) => AuthUser | null;
  /** Google mock: sign in as the chosen account, creating it if needed. */
  logInWithGoogle: (account: { email: string; name: string }) => AuthUser;
  cancelPending: () => void;
  logOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: {},
      currentEmail: null,
      pending: null,

      requestCode: (email) => {
        const code = generateCode();
        set({ pending: { email: normalizeEmail(email), code, verified: false } });
        return code;
      },

      verifyCode: (code) => {
        const pending = get().pending;
        if (!pending || pending.code !== code.trim()) return "invalid";
        const user = get().users[pending.email];
        if (user) {
          set({ currentEmail: pending.email, pending: null });
          return "ok";
        }
        set({ pending: { ...pending, verified: true } });
        return "new";
      },

      completeSignup: (name) => {
        const pending = get().pending;
        if (!pending?.verified) return null;
        const user: AuthUser = {
          email: pending.email,
          name: name.trim() || pending.email,
          provider: "email",
        };
        set({
          users: { ...get().users, [pending.email]: user },
          currentEmail: pending.email,
          pending: null,
        });
        return user;
      },

      logInWithGoogle: ({ email, name }) => {
        const normalized = normalizeEmail(email);
        const user: AuthUser = get().users[normalized] ?? {
          email: normalized,
          name,
          provider: "google",
        };
        set({
          users: { ...get().users, [normalized]: user },
          currentEmail: normalized,
          pending: null,
        });
        return user;
      },

      cancelPending: () => set({ pending: null }),
      logOut: () => set({ currentEmail: null, pending: null }),
    }),
    {
      // v2: passwordless; the old email+password demo accounts are left behind
      name: "rimkirim:auth:v2",
      partialize: (s) => ({ users: s.users, currentEmail: s.currentEmail }),
    },
  ),
);

/** The currently signed-in user (or null). */
export function useCurrentUser(): AuthUser | null {
  const currentEmail = useAuthStore((s) => s.currentEmail);
  const users = useAuthStore((s) => s.users);
  return currentEmail ? users[currentEmail] ?? null : null;
}

/** Client hydration flag so auth guards don't redirect before the store loads. */
export function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    const p = useAuthStore.persist;
    if (!p) {
      setHydrated(true);
      return;
    }
    const unsub = p.onFinishHydration(() => setHydrated(true));
    if (p.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}
