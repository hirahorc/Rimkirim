"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginValues } from "@/lib/schemas/auth";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useOrderStore, useOrderHydrated } from "@/lib/store/useOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Input, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthShell } from "./AuthShell";
import { RateReceipt } from "@/components/order/RateReceipt";

export function LoginForm({ next }: { next: string | null }) {
  const t = useT();
  const router = useRouter();
  const logIn = useAuthStore((s) => s.logIn);
  // a rate choice stashed before login — keep the decision in sight while
  // the visitor signs in, so the login wall doesn't swallow it
  const orderHydrated = useOrderHydrated();
  const pendingStart = useOrderStore((s) => s.pendingStart);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (d: LoginValues) => {
    const res = logIn(d);
    if (res.ok) {
      toast.success(t("auth.loggedIn"));
      const dest = next && next.startsWith("/") ? next : "/";
      router.replace(dest);
    } else {
      toast.error(t("auth.invalidCredentials"));
    }
  };

  return (
    <AuthShell
      title={t("auth.loginTitle")}
      subtitle={t("auth.loginSubtitle")}
      switchHref="/daftar"
      switchPre={t("auth.loginLinkPre")}
      switchLabel={t("auth.loginLink")}
    >
      {orderHydrated && pendingStart && (
        <RateReceipt
          context={pendingStart.context}
          rate={pendingStart.rate}
          variant="card"
          className="mb-5"
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
            autoComplete="current-password"
            placeholder={t("auth.passwordPlaceholder")}
            {...register("password")}
          />
          <FieldError>{errors.password && t(errors.password.message ?? "")}</FieldError>
        </div>
        <Button type="submit" size="lg" className="w-full">
          {t("auth.loginCta")}
        </Button>
      </form>
    </AuthShell>
  );
}
