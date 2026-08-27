"use client";

import { Toaster as SonnerToaster } from "sonner";

// richColors owns each type's bg/border/text; the app's status tokens are
// aligned to the same palette (see globals.css), so toasts and in-app status
// surfaces read as one system. Only the radius is ours — Sonner's 8px default
// isn't on the scale (toast padding is 16px, so `sm` clears the Clearance Rule).
export function Toaster() {
  return (
    <SonnerToaster
      theme="light"
      richColors
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: "var(--radius-sm)",
        },
      }}
    />
  );
}
