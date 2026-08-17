"use client";

import * as React from "react";
import { Label, FieldError } from "@/components/ui/input";

/** Labeled field wrapper with optional hint + error. */
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      {children}
      {hint && <p className="mt-1 text-xs text-muted-2">{hint}</p>}
      <FieldError>{error}</FieldError>
    </div>
  );
}
