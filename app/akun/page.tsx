import type { Metadata } from "next";
import { AccountSettings } from "@/components/account/AccountSettings";

export const metadata: Metadata = {
  title: "Akun · Rimkirim",
  description: "Kelola identitas akun Rimkirim kamu.",
  robots: { index: false },
};

export default function AkunPage() {
  return <AccountSettings />;
}
