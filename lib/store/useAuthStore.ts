"use client";

import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  email: string;
  name: string;
  passwordHash: string;
}

export interface AuthResult {
  ok: boolean;
  /** "exists" → sign-up hit a taken email; "invalid" → login credentials don't match. */
  error?: "exists" | "invalid";
  user?: AuthUser;
}

/**
 * Mock auth — NOT real security. Accounts and the session live in localStorage
 * with a trivial hash, purely so the demo survives reloads and can be gated.
 * A real backend replaces this store wholesale later.
 */
function hashPassword(password: string): string {
  // djb2-style scramble for the demo only — never use for real credentials
  let h = 0x811c9dc5;
  for (let i = 0; i < password.length; i++) {
    h = Math.imul(h ^ password.charCodeAt(i), 0x01000193) >>> 0;
  }
  return h.toString(16);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

interface AuthState {
  users: Record<string, AuthUser>;
  currentEmail: string | null;
  signUp: (input: { name: string; email: string; password: string }) => AuthResult;
  logIn: (input: { email: string; password: string }) => AuthResult;
  logOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: {},
      currentEmail: null,

      signUp: ({ name, email, password }) => {
        const normalized = normalizeEmail(email);
        if (get().users[normalized]) return { ok: false, error: "exists" };
        const user: AuthUser = {
          email: normalized,
          name: name.trim() || normalized,
          passwordHash: hashPassword(password),
        };
        set({ users: { ...get().users, [normalized]: user }, currentEmail: normalized });
        return { ok: true, user };
      },

      logIn: ({ email, password }) => {
        const normalized = normalizeEmail(email);
        const user = get().users[normalized];
        if (!user || user.passwordHash !== hashPassword(password)) {
          return { ok: false, error: "invalid" };
        }
        set({ currentEmail: normalized });
        return { ok: true, user };
      },

      logOut: () => set({ currentEmail: null }),
    }),
    {
      name: "rimkirim:auth",
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
