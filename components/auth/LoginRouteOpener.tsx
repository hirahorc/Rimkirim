"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLoginModal } from "@/lib/store/useLoginModal";
import { useAuthStore, useAuthHydrated } from "@/lib/store/useAuthStore";

/** Opens the login modal on mount for the /masuk route (already signed in → go straight to next). */
export function LoginRouteOpener({ next }: { next: string | null }) {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const currentEmail = useAuthStore((s) => s.currentEmail);
  const openModal = useLoginModal((s) => s.openModal);

  React.useEffect(() => {
    if (!hydrated) return;
    if (currentEmail) {
      router.replace(next && next.startsWith("/") ? next : "/");
      return;
    }
    openModal({ next, fromRoute: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return null;
}
