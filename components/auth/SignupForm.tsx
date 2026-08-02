"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signupSchema, type SignupValues } from "@/lib/schemas/auth";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Input, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthShell } from "./AuthShell";

export function SignupForm({ next }: { next: string | null }) {
  const t = useT();
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUp);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = (d: SignupValues) => {
    const res = signUp(d);
    if (res.ok) {
      toast.success(t("auth.accountCreated"));
      const dest = next && next.startsWith("/") ? next : "/";
      router.replace(dest);
    } else {
      toast.error(t("auth.emailExists"));
    }
  };

  return (
    <AuthShell
      title={t("auth.signupTitle")}
      subtitle={t("auth.signupSubtitle")}
      switchHref="/masuk"
      switchPre={t("auth.signupLinkPre")}
      switchLabel={t("auth.signupLink")}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">
            {t("auth.nameLabel")}
          </label>
          <Input
            autoComplete="name"
            placeholder={t("auth.namePlaceholder")}
            {...register("name")}
          />
          <FieldError>{errors.name && t(errors.name.message ?? "")}</FieldError>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">
            {t("auth.emailLabel")}
          </label>
          <Input
            type="email"
            autoComplete="email"
            placeholder={t("auth.emailPlaceholder")}
            {...register("email")}
          />
          <FieldError>{errors.email && t(errors.email.message ?? "")}</FieldError>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">
            {t("auth.passwordLabel")}
          </label>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder={t("auth.passwordPlaceholder")}
            {...register("password")}
          />
          <FieldError>{errors.password && t(errors.password.message ?? "")}</FieldError>
        </div>
        <Button type="submit" size="lg" className="w-full">
          {t("auth.signupCta")}
        </Button>
      </form>
    </AuthShell>
  );
}
