import { OrderShell } from "@/components/order/OrderShell";

export default function PesanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OrderShell>{children}</OrderShell>;
}
