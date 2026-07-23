"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="top-center"
      toastOptions={{
        style: {
          background: "var(--surface-2)",
          border: "1px solid var(--border-strong)",
          color: "var(--foreground)",
          borderRadius: "var(--radius-sm)",
        },
      }}
    />
  );
}
