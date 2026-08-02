import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Daftar — Rimkirim",
  description: "Buat akun Rimkirim untuk mulai order & melacak kiriman.",
};

export default async function DaftarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <SignupForm next={typeof next === "string" ? next : null} />;
}
