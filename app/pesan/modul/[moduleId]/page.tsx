import { ModuleForm } from "@/components/order/ModuleForm";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  return <ModuleForm moduleId={moduleId} />;
}
