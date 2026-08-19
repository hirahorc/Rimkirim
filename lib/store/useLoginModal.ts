"use client";

import { create } from "zustand";

interface LoginModalState {
  open: boolean;
  /** where to go after a successful sign-in; null = stay on the current page */
  next: string | null;
  /**
   * true when the modal was opened by the /masuk route (auth guard redirect):
   * closing it without signing in leaves the visitor on "/" instead of a
   * blank login page.
   */
  fromRoute: boolean;
  openModal: (opts?: { next?: string | null; fromRoute?: boolean }) => void;
  close: () => void;
}

export const useLoginModal = create<LoginModalState>()((set) => ({
  open: false,
  next: null,
  fromRoute: false,
  openModal: (opts) =>
    set({ open: true, next: opts?.next ?? null, fromRoute: opts?.fromRoute ?? false }),
  close: () => set({ open: false }),
}));
