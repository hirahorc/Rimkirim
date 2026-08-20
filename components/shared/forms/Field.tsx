"use client";

import * as React from "react";
import { Label, FieldError } from "@/components/ui/input";

/**
 * Labeled field wrapper with optional hint + error, WIRED: the label points at
 * the control (htmlFor/id), and the control is marked invalid and described by
 * its hint and error, so screen readers hear the caption and the failure, and
 * clicking the label focuses the input. Composite children (PhoneInput, custom
 * selects) receive the same props and forward them to their real control.
 */
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
  const id = React.useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const child = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })
    : children;
  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      {child}
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-muted-2">
          {hint}
        </p>
      )}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
