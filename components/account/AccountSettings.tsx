"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, LogOut, UserX } from "lucide-react";
import {
  useAuthStore,
  useCurrentUser,
  useAuthHydrated,
} from "@/lib/store/useAuthStore";
import { nameSchema, type NameValues } from "@/lib/schemas/auth";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/**
 * /akun — the account's one home: rename, see the identity email (read-only,
 * it is the ownership key everywhere), sign out, and the delete door.
 * Deliberately identity-only: shipping defaults and preferences live where
 * they are used, not here.
 */
export function AccountSettings() {
  const t = useT();
  const router = useRouter();
  const authHydrated = useAuthHydrated();
  const user = useCurrentUser();
  const updateName = useAuthStore((s) => s.updateName);
  const logOut = useAuthStore((s) => s.logOut);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    if (!authHydrated) return;
    if (!user) router.replace("/masuk?next=/akun");
  }, [authHydrated, user, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NameValues>({
    resolver: zodResolver(nameSchema),
    values: { name: user?.name ?? "" },
  });
  const nameValue = watch("name");
  const unchanged = (nameValue ?? "").trim() === (user?.name ?? "");

  if (!authHydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  const onSubmit = (values: NameValues) => {
    updateName(values.name);
    toast.success(t("auth.acctSavedToast"));
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("auth.acctTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-muted">{t("auth.acctSubtitle")}</p>
      </header>

      <div className="space-y-4">
        {/* identity */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div
              aria-hidden
              className="grid size-14 shrink-0 place-items-center rounded-full bg-surface-2 font-display text-xl font-bold text-foreground"
            >
              {user.name.trim().charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{user.name}</p>
              <p className="truncate text-sm text-muted">{user.email}</p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-5 border-t border-border pt-5"
          >
            <Label htmlFor="acct-name">{t("auth.acctNameLabel")}</Label>
            <div className="flex gap-2">
              <Input
                id="acct-name"
                autoComplete="name"
                placeholder={t("auth.namePlaceholder")}
                className="flex-1"
                {...register("name")}
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={unchanged}
                className="h-11 shrink-0"
              >
                {t("auth.acctSave")}
              </Button>
            </div>
            <FieldError>{t(errors.name?.message ?? "")}</FieldError>
            <p className="mt-1.5 text-xs text-muted-2">
              {t("auth.nameSubtitle")}
            </p>

            <div className="mt-4">
              <Label>{t("auth.acctEmailLabel")}</Label>
              <p className="text-sm text-foreground">{user.email}</p>
              <p className="mt-1 text-xs text-muted-2">
                {t("auth.acctEmailNote")}
              </p>
            </div>

            <div className="mt-4">
              <Label>{t("auth.acctProviderLabel")}</Label>
              <Badge variant="neutral">
                {user.provider === "google"
                  ? t("auth.acctProviderGoogle")
                  : t("auth.acctProviderEmail")}
              </Badge>
            </div>
          </form>
        </Card>

        {/* session */}
        <Card className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight">
              {t("auth.acctSessionTitle")}
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {t("auth.acctSessionBody")}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              logOut();
              toast.success(t("auth.loggedOut"));
              router.push("/");
            }}
          >
            <LogOut className="size-4" /> {t("auth.logout")}
          </Button>
        </Card>

        {/* danger zone */}
        <Card className="flex flex-wrap items-center justify-between gap-3 border-danger/25 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight text-danger-ink">
              {t("auth.acctDangerTitle")}
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {t("auth.acctDangerBody")}
            </p>
          </div>
          <Button
            type="button"
            variant="danger"
            onClick={() => setDeleteOpen(true)}
          >
            {t("auth.acctDeleteCta")}
          </Button>
        </Card>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              <UserX />
              {t("auth.acctDeleteDialogTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("auth.acctDeleteDialogBody")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              {t("pl.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setDeleteOpen(false);
                deleteAccount();
                toast.info(t("auth.acctDeletedToast"));
                router.push("/");
              }}
            >
              {t("auth.acctDeleteConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
