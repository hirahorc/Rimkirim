"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  emailSchema,
  nameSchema,
  type EmailValues,
  type NameValues,
} from "@/lib/schemas/auth";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useLoginModal } from "@/lib/store/useLoginModal";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CoverPlaceholder } from "@/components/articles/CoverPlaceholder";
import { GoogleMark } from "./GoogleMark";
import { cn } from "@/lib/utils/cn";

/**
 * Passwordless sign-in / sign-up modal: image panel left, form panel right.
 * Steps: email → 6-digit code → (new emails only) name. A mock Google account
 * chooser sits behind the Google button. Mounted once in the app layout;
 * opened from the header, the mobile nav, and the /masuk route.
 */

type Step = "email" | "code" | "name" | "google";

/** Login cover (16:9 source; the panel is portrait, so focus sits right of centre where the lettering is). */
const LOGIN_IMAGE_SRC: string | null = "/auth/login-cover.jpg";

const GOOGLE_ACCOUNTS = [
  { name: "Hira Rimkirim", email: "hira.rimkirim@gmail.com" },
  { name: "Rimi Putri", email: "rimi.putri@gmail.com" },
];

const RESEND_SECONDS = 30;
const CODE_LENGTH = 6;

export function LoginDialog() {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const { open, next, fromRoute, close } = useLoginModal();
  const currentEmail = useAuthStore((s) => s.currentEmail);
  const cancelPending = useAuthStore((s) => s.cancelPending);

  // remount the flow (fresh step + email) each time the modal opens
  const [session, setSession] = React.useState(0);

  const finish = React.useCallback(
    (toastKey: "auth.loggedIn" | "auth.accountCreated") => {
      toast.success(t(toastKey));
      setSession((n) => n + 1);
      close();
      const dest = next && next.startsWith("/") ? next : null;
      if (dest) router.replace(dest);
      else if (fromRoute || pathname === "/masuk") router.replace("/");
    },
    [t, close, next, fromRoute, pathname, router],
  );

  const onOpenChange = (v: boolean) => {
    if (v) return;
    setSession((n) => n + 1);
    close();
    cancelPending();
    // arrived via the /masuk guard and bailed: don't strand them on a bare page
    if (!currentEmail && (fromRoute || pathname === "/masuk")) router.replace("/");
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dlg-overlay fixed inset-0 z-50 bg-foreground/25 backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "dlg-panel fixed z-50 flex overflow-hidden bg-surface text-foreground outline-none",
            // mobile: full-screen sheet
            "inset-0 h-dvh w-screen flex-col",
            // desktop: centred, large, split panel
            "md:inset-auto md:left-1/2 md:top-1/2 md:h-auto md:max-h-[90dvh] md:min-h-[600px] md:w-[calc(100vw-3rem)] md:max-w-5xl md:-translate-x-1/2 md:-translate-y-1/2 md:flex-row md:rounded-lg md:border md:border-border-strong md:shadow-overlay",
          )}
        >
          {/* left: image */}
          <div className="relative hidden md:block md:w-[55%] md:shrink-0">
            {LOGIN_IMAGE_SRC ? (
              <Image
                src={LOGIN_IMAGE_SRC}
                alt=""
                fill
                sizes="(min-width: 768px) 560px, 0px"
                priority={false}
                className="object-cover object-[90%_center]"
              />
            ) : (
              <CoverPlaceholder slug="login" title="Rimkirim Masuk" />
            )}
          </div>

          {/* right: form */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-8 pt-16 md:px-12 md:pb-10 md:pt-14 lg:px-14">
            <Image
              src="/rimkirim-logo-dark.png"
              alt="Rimkirim"
              width={1796}
              height={618}
              sizes="88px"
              className="h-6 w-auto self-start"
            />
            <div className="mt-8 md:my-auto md:py-8">
              <LoginFlow key={session} finish={finish} />
            </div>
            <div className="mt-8 space-y-2 text-center text-[11px] leading-relaxed text-muted-2 md:mt-0">
              <p>
                {t("auth.legalPre")}{" "}
                <Link href="/terms" className="link-mark" onClick={close}>
                  {t("auth.legalTerms")}
                </Link>{" "}
                {t("auth.legalAnd")}{" "}
                <Link href="/privacy" className="link-mark" onClick={close}>
                  {t("auth.legalPrivacy")}
                </Link>
                .
              </p>
              <p>{t("auth.demoNote")}</p>
            </div>
          </div>

          <DialogPrimitive.Close className="tap-target absolute right-4 top-4 grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-surface-3 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50">
            <X className="size-4" />
            <span className="sr-only">{t("common.close")}</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/* ---------- steps ---------- */

function LoginFlow({
  finish,
}: {
  finish: (toastKey: "auth.loggedIn" | "auth.accountCreated") => void;
}) {
  const cancelPending = useAuthStore((s) => s.cancelPending);
  const [step, setStep] = React.useState<Step>("email");
  const [email, setEmail] = React.useState("");
  return (
    <>
      {step === "email" && (
        <EmailStep
          onGoogle={() => setStep("google")}
          onSent={(e) => {
            setEmail(e);
            setStep("code");
          }}
        />
      )}
      {step === "code" && (
        <CodeStep
          email={email}
          onChangeEmail={() => {
            cancelPending();
            setStep("email");
          }}
          onSignedIn={() => finish("auth.loggedIn")}
          onNeedsName={() => setStep("name")}
        />
      )}
      {step === "name" && (
        <NameStep onDone={() => finish("auth.accountCreated")} />
      )}
      {step === "google" && (
        <GoogleChooser
          onBack={() => setStep("email")}
          onDone={(isNew) =>
            finish(isNew ? "auth.accountCreated" : "auth.loggedIn")
          }
        />
      )}
    </>
  );
}

function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <DialogPrimitive.Title className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </DialogPrimitive.Title>
      <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
    </div>
  );
}

function EmailStep({
  onGoogle,
  onSent,
}: {
  onGoogle: () => void;
  onSent: (email: string) => void;
}) {
  const t = useT();
  const requestCode = useAuthStore((s) => s.requestCode);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailValues>({ resolver: zodResolver(emailSchema) });

  const onSubmit = ({ email }: EmailValues) => {
    const code = requestCode(email);
    deliverCode(t, code);
    onSent(email.trim().toLowerCase());
  };

  return (
    <>
      <StepHeading title={t("auth.title")} subtitle={t("auth.subtitle")} />
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={onGoogle}
      >
        <GoogleMark className="size-5" />
        {t("auth.google")}
      </Button>
      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.12em] text-muted-2">
        <span className="h-px flex-1 bg-border" />
        {t("auth.or")}
        <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="login-email">{t("auth.emailLabel")}</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder={t("auth.emailPlaceholder")}
            {...register("email")}
          />
          <FieldError>{errors.email && t(errors.email.message ?? "")}</FieldError>
        </div>
        <Button type="submit" size="lg" className="w-full">
          {t("auth.sendCode")}
        </Button>
      </form>
    </>
  );
}

function CodeStep({
  email,
  onChangeEmail,
  onSignedIn,
  onNeedsName,
}: {
  email: string;
  onChangeEmail: () => void;
  onSignedIn: () => void;
  onNeedsName: () => void;
}) {
  const t = useT();
  const verifyCode = useAuthStore((s) => s.verifyCode);
  const requestCode = useAuthStore((s) => s.requestCode);
  const [digits, setDigits] = React.useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = React.useState(false);
  const [left, setLeft] = React.useState(RESEND_SECONDS);
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (left <= 0) return;
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [left]);

  React.useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const submit = React.useCallback(
    (code: string) => {
      const res = verifyCode(code);
      if (res === "invalid") {
        setError(true);
        setDigits(Array(CODE_LENGTH).fill(""));
        refs.current[0]?.focus();
        return;
      }
      if (res === "ok") onSignedIn();
      else onNeedsName();
    },
    [verifyCode, onSignedIn, onNeedsName],
  );

  const setAt = (i: number, v: string) => {
    const nextDigits = [...digits];
    nextDigits[i] = v;
    setDigits(nextDigits);
    setError(false);
    if (v && i < CODE_LENGTH - 1) refs.current[i + 1]?.focus();
    const code = nextDigits.join("");
    if (code.length === CODE_LENGTH) submit(code);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!text) return;
    e.preventDefault();
    const nextDigits = Array(CODE_LENGTH)
      .fill("")
      .map((_, i) => text[i] ?? "");
    setDigits(nextDigits);
    refs.current[Math.min(text.length, CODE_LENGTH - 1)]?.focus();
    if (text.length === CODE_LENGTH) submit(text);
  };

  const resend = () => {
    const code = requestCode(email);
    deliverCode(t, code, t("auth.codeResent"));
    setLeft(RESEND_SECONDS);
    setDigits(Array(CODE_LENGTH).fill(""));
    setError(false);
    refs.current[0]?.focus();
  };

  return (
    <>
      <StepHeading
        title={t("auth.codeTitle")}
        subtitle={`${t("auth.codeSentTo")} ${email}`}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(digits.join(""));
        }}
        noValidate
      >
        <Label htmlFor="login-code-0">{t("auth.codeLabel")}</Label>
        <div className="flex gap-2" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              id={`login-code-${i}`}
              ref={(el) => {
                refs.current[i] = el;
              }}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              pattern="[0-9]*"
              maxLength={1}
              value={d}
              aria-label={`${t("auth.codeLabel")} ${i + 1}`}
              onChange={(e) => setAt(i, e.target.value.replace(/\D/g, "").slice(-1))}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !digits[i] && i > 0) {
                  refs.current[i - 1]?.focus();
                }
              }}
              className={cn(
                "h-14 min-w-0 flex-1 rounded-md border bg-surface-2 text-center font-mono text-xl font-semibold text-foreground transition-colors",
                "focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40",
                error ? "border-danger" : "border-border",
              )}
            />
          ))}
        </div>
        <FieldError>{error && t("auth.codeInvalid")}</FieldError>
        <Button type="submit" size="lg" className="mt-4 w-full">
          {t("auth.verify")}
        </Button>
      </form>
      <div className="mt-4 flex items-center justify-between text-sm">
        <button type="button" onClick={onChangeEmail} className="link-mark">
          {t("auth.changeEmail")}
        </button>
        {left > 0 ? (
          <span className="text-muted-2 tabular-nums">
            {t("auth.resendIn").replace("{s}", String(left))}
          </span>
        ) : (
          <button type="button" onClick={resend} className="link-mark">
            {t("auth.resend")}
          </button>
        )}
      </div>
    </>
  );
}

function NameStep({ onDone }: { onDone: () => void }) {
  const t = useT();
  const completeSignup = useAuthStore((s) => s.completeSignup);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NameValues>({ resolver: zodResolver(nameSchema) });

  return (
    <>
      <StepHeading title={t("auth.nameTitle")} subtitle={t("auth.nameSubtitle")} />
      <form
        onSubmit={handleSubmit(({ name }) => {
          if (completeSignup(name)) onDone();
        })}
        className="space-y-4"
        noValidate
      >
        <div>
          <Label htmlFor="login-name">{t("auth.nameLabel")}</Label>
          <Input
            id="login-name"
            autoComplete="name"
            autoFocus
            placeholder={t("auth.namePlaceholder")}
            {...register("name")}
          />
          <FieldError>{errors.name && t(errors.name.message ?? "")}</FieldError>
        </div>
        <Button type="submit" size="lg" className="w-full">
          {t("auth.nameCta")}
        </Button>
      </form>
    </>
  );
}

function GoogleChooser({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: (isNew: boolean) => void;
}) {
  const t = useT();
  const users = useAuthStore((s) => s.users);
  const logInWithGoogle = useAuthStore((s) => s.logInWithGoogle);
  const [busy, setBusy] = React.useState<string | null>(null);

  const pick = (acc: (typeof GOOGLE_ACCOUNTS)[number]) => {
    setBusy(acc.email);
    const isNew = !users[acc.email];
    // a beat of "talking to Google" so the mock reads as an OAuth round-trip
    setTimeout(() => {
      logInWithGoogle(acc);
      onDone(isNew);
    }, 700);
  };

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <GoogleMark className="size-7" />
        <div>
          <DialogPrimitive.Title className="font-display text-xl font-bold tracking-tight">
            {t("auth.googleChooserTitle")}
          </DialogPrimitive.Title>
          <p className="text-sm text-muted">{t("auth.googleChooserSubtitle")}</p>
        </div>
      </div>
      <ul className="divide-y divide-border rounded-md border border-border">
        {GOOGLE_ACCOUNTS.map((acc) => (
          <li key={acc.email}>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => pick(acc)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2 disabled:opacity-60"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand font-display text-sm font-bold text-brand-ink">
                {acc.name[0]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{acc.name}</span>
                <span className="block truncate text-xs text-muted">{acc.email}</span>
              </span>
              {busy === acc.email && <Loader2 className="size-4 animate-spin text-muted" />}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onBack}
        disabled={busy !== null}
        className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {t("auth.googleChooserBack")}
      </button>
    </>
  );
}

/** Mock delivery: the code goes to a toast (and the console) instead of an inbox. */
function deliverCode(t: (k: string) => string, code: string, prefix?: string) {
  const msg = t("auth.codeToast").replace("{code}", code);
  console.info(`[rimkirim mock auth] ${msg}`);
  toast(prefix ? `${prefix} · ${msg}` : msg, { duration: 15000 });
}
