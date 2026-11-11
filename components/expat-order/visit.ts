"use client";

import * as React from "react";
import { toast } from "sonner";

/* What the order flow keeps for one visit (sessionStorage), beside the draft
   itself: small facts that make a moment said once, never state the order
   depends on. Storage that isn't there only means the moment goes unsaid. */

const WELCOMED = "rimkirim:expat-order:welcomed";
const BOOKED = "rimkirim:expat-order:booked";

/**
 * Says, once a visit, that the answers from an earlier one are still here.
 * The first screen of the flow to load settles it, whether or not there was
 * a draft, so answers given during this visit are never "kept" back at their
 * author.
 */
export function useDraftWelcome(ready: boolean, hasDraft: boolean, message: string) {
  React.useEffect(() => {
    if (!ready) return;
    try {
      if (window.sessionStorage.getItem(WELCOMED)) return;
      window.sessionStorage.setItem(WELCOMED, "1");
    } catch {
      return;
    }
    // an id, so an effect run twice (Strict Mode) still says it once
    if (hasDraft) toast(message, { id: "expat-draft-kept" });
  }, [ready, hasDraft, message]);
}

/** Confirm application marks the booking it just made, so its Booking
 *  Summary can tell arriving from a reload or a link back to it */
export function markJustBooked(number: string) {
  try {
    window.sessionStorage.setItem(BOOKED, number);
  } catch {
    /* the summary simply opens without its moment */
  }
}

export function justBooked(): string | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage.getItem(BOOKED);
  } catch {
    return null;
  }
}

export function clearJustBooked() {
  try {
    window.sessionStorage.removeItem(BOOKED);
  } catch {
    /* nothing to clear */
  }
}
