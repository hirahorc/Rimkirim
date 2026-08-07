import type { Metadata } from "next";
import { Questionnaire } from "@/components/order/Questionnaire";

export const metadata: Metadata = {
  title: "Order · Rimkirim",
};

export default function PesanPage() {
  return <Questionnaire />;
}
