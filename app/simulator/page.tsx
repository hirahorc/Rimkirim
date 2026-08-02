import type { Metadata } from "next";
import { OpsPanel } from "@/components/tracking/OpsPanel";

export const metadata: Metadata = {
  title: "Ops Simulator",
};

export default function SimulatorPage() {
  return <OpsPanel />;
}
