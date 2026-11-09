"use client";

import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makeBookingNumber } from "@/lib/utils/order-ids";
import type { ExpatRate } from "@/lib/pricing/expat-rates";
import {
  EMPTY_CHECK,
  EMPTY_DETAILS,
  EMPTY_ELIGIBILITY,
  TEAM_INBOX,
  addressReady,
  checkComplete,
  customsCategory,
  detailsProgress,
  eligibilityProgress,
  type CheckRateInput,
  type DetailsInput,
  type EligibilityAnswers,
  type ExpatBooking,
} from "@/lib/order/expat-order";

/** which side's Address changed since its Detail Address was given */
export type AddressChange = { origin: boolean; destination: boolean };

interface ExpatOrderState {
  /** the order being filled in, kept across reloads until it's submitted */
  check: CheckRateInput;
  rate: ExpatRate | null;
  eligibility: EligibilityAnswers;
  details: DetailsInput;
  /** set when a changed Address cleared that side's detail and pin */
  addressChanged: AddressChange;
  /** every submitted booking: the internal system's tickets (mock) */
  bookings: ExpatBooking[];

  setCheck: (next: CheckRateInput) => void;
  selectRate: (rate: ExpatRate) => void;
  setEligibility: (patch: Partial<EligibilityAnswers>) => void;
  setDetails: (patch: Partial<DetailsInput>) => void;
  dismissAddressChange: (side: keyof AddressChange) => void;
  /** registers the ticket and clears the draft; null when anything's missing */
  submit: () => ExpatBooking | null;
}

export const useExpatOrderStore = create<ExpatOrderState>()(
  persist(
    (set, get) => ({
      check: EMPTY_CHECK,
      rate: null,
      eligibility: EMPTY_ELIGIBILITY,
      details: EMPTY_DETAILS,
      addressChanged: { origin: false, destination: false },
      bookings: [],

      setCheck: (next) => {
        const { check, details, addressChanged } = get();
        // a new place on one side clears that side's detail and pin, so the
        // courier is never sent to a pin set for the old Address; a new
        // origin country also moves the dial code, unless it was picked
        const originMoved =
          next.originCountry !== check.originCountry || next.origin?.id !== check.origin?.id;
        const destinationMoved = next.destination?.id !== check.destination?.id;
        const patch: Partial<DetailsInput> = {};
        const changed = { ...addressChanged };
        if (originMoved && (details.originDetail || details.originPin)) {
          patch.originDetail = "";
          patch.originPin = undefined;
          changed.origin = true;
        }
        if (destinationMoved && (details.destinationDetail || details.destinationPin)) {
          patch.destinationDetail = "";
          patch.destinationPin = undefined;
          changed.destination = true;
        }
        if (next.originCountry !== check.originCountry && !details.dialTouched) {
          patch.dialIso = next.originCountry;
        }
        // the picked rate was priced on the old country and weight
        const repriced = next.originCountry !== check.originCountry || next.weightKg !== check.weightKg;
        set({
          check: next,
          details: { ...details, ...patch },
          addressChanged: changed,
          ...(repriced ? { rate: null } : {}),
        });
      },

      selectRate: (rate) => set({ rate }),

      setEligibility: (patch) => set((s) => ({ eligibility: { ...s.eligibility, ...patch } })),

      setDetails: (patch) =>
        set((s) => {
          const changed = { ...s.addressChanged };
          if (patch.originDetail !== undefined || patch.originPin !== undefined) changed.origin = false;
          if (patch.destinationDetail !== undefined || patch.destinationPin !== undefined) changed.destination = false;
          return { details: { ...s.details, ...patch }, addressChanged: changed };
        }),

      dismissAddressChange: (side) =>
        set((s) => ({ addressChanged: { ...s.addressChanged, [side]: false } })),

      submit: () => {
        const { check, rate, eligibility, details, bookings } = get();
        if (
          !checkComplete(check) ||
          !addressReady(check.origin) ||
          !addressReady(check.destination) ||
          !check.weightKg ||
          !rate ||
          !eligibilityProgress(eligibility).done ||
          !detailsProgress(details).done
        ) {
          return null;
        }
        const booking: ExpatBooking = {
          number: makeBookingNumber(),
          createdAt: new Date().toISOString(),
          check: { ...check, origin: check.origin, destination: check.destination, weightKg: check.weightKg },
          rate,
          eligibility,
          details,
          customsCategory: customsCategory(eligibility),
          emailTo: [details.email.trim(), TEAM_INBOX],
        };
        set({
          bookings: [booking, ...bookings],
          check: EMPTY_CHECK,
          rate: null,
          eligibility: EMPTY_ELIGIBILITY,
          details: EMPTY_DETAILS,
          addressChanged: { origin: false, destination: false },
        });
        return booking;
      },
    }),
    {
      name: "rimkirim:expat-order",
      version: 1,
      partialize: (s) => ({
        check: s.check,
        rate: s.rate,
        eligibility: s.eligibility,
        details: s.details,
        addressChanged: s.addressChanged,
        bookings: s.bookings,
      }),
    },
  ),
);

const subscribeHydration = (onDone: () => void) => useExpatOrderStore.persist.onFinishHydration(onDone);
const readHydrated = () => useExpatOrderStore.persist.hasHydrated();

/** True once the persisted draft has loaded on the client; false on the
 *  server and the first client render, so the two match */
export function useExpatOrderHydrated(): boolean {
  return React.useSyncExternalStore(subscribeHydration, readHydrated, () => false);
}
