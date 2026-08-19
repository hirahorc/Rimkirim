import type { Metadata } from "next";
import Home from "../page";
import { LoginRouteOpener } from "@/components/auth/LoginRouteOpener";

export const metadata: Metadata = {
  title: "Masuk · Rimkirim",
  description: "Masuk ke akun Rimkirim untuk mengelola pesanan & tracking.",
  robots: { index: false },
};

/**
 * Login is a modal, not a page. This route exists as the target of auth
 * guards (`/masuk?next=…`): it renders the homepage underneath and opens the
 * login modal on top. Signing in sends the visitor to `next`; closing without
 * signing in returns them to "/".
 */
export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <>
      <LoginRouteOpener next={typeof next === "string" ? next : null} />
      <Home />
    </>
  );
}
