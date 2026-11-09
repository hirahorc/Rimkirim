import type { Metadata } from "next";
import { BookingView } from "@/components/expat-order/BookingView";

export const metadata: Metadata = {
  title: "Booking received · Expat Relocation · Rimkirim",
  robots: { index: false },
};

/** the Booking Summary; the booking itself lives in the browser (mock) */
export default async function ExpatBookingPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  return <BookingView number={number} />;
}
