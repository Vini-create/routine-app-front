"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/app/BrandMark";
import { LanguageSelect } from "@/components/app/LanguageSelect";
import { useLanguage, useTranslations } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input, PasswordInput } from "@/components/ui/Form";
import { ApiError } from "@/lib/api";
import { getAuthErrorMessage, getFieldIssue } from "@/lib/authErrors";
import { appToApiLanguage } from "@/lib/api-contracts";
import { authApi } from "@/lib/authApi";
import { savePendingVerificationEmail } from "@/lib/session";
import { usePublicOnly } from "@/components/app/usePublicOnly";

export default function RegisterPage() {
  const labels = useTranslations("authFlow");
  const { language } = useLanguage();
  const router = useRouter();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  usePublicOnly();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    if (password !== String(formData.get("confirmPassword"))) {
      setError(labels.passwordMismatch);
      return;
    }
    setError(""); setFieldErrors({});
    setLoading(true);
    try {
      await authApi.register({
        email,
        password,
        display_name: String(formData.get("displayName")),
        language: appToApiLanguage[language],
      });
      savePendingVerificationEmail(email);
      router.push("/verify-email?registered=1");
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 503) {
        savePendingVerificationEmail(email);
        router.push("/verify-email?delivery=failed");
      } else if (cause instanceof ApiError && /already registered|já cadastrado/i.test(cause.detail)) {
        savePendingVerificationEmail(email);
        router.push("/verify-email?existing=1");
      } else {
        setFieldErrors({
          displayName: getFieldIssue(cause, "display_name"),
          email: getFieldIssue(cause, "email"),
          password: getFieldIssue(cause, "password"),
        });
        setError(getAuthErrorMessage(cause, labels));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="alfredPage grid min-h-dvh place-items-center px-5 py-10">
      <Card className="w-full max-w-md">
        <BrandMark className="mb-6" />
        <h1 className="font-brand text-4xl font-semibold">{labels.registerTitle}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{labels.registerSubtitle}</p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <FieldLabel label={labels.name}><Input name="displayName" autoComplete="name" minLength={2} maxLength={100} aria-invalid={Boolean(fieldErrors.displayName)} required />{fieldErrors.displayName ? <span className="text-xs text-red-500">{fieldErrors.displayName}</span> : null}</FieldLabel>
          <FieldLabel label={labels.email}><Input name="email" type="email" autoComplete="email" aria-invalid={Boolean(fieldErrors.email)} required />{fieldErrors.email ? <span className="text-xs text-red-500">{fieldErrors.email}</span> : null}</FieldLabel>
          <FieldLabel label={labels.password}><PasswordInput name="password" autoComplete="new-password" minLength={8} maxLength={72} aria-invalid={Boolean(fieldErrors.password)} showLabel={labels.showPassword} hideLabel={labels.hidePassword} required /><span className="text-xs font-normal text-[var(--text-tertiary)]">{labels.passwordHint}</span>{fieldErrors.password ? <span className="text-xs text-red-500">{fieldErrors.password}</span> : null}</FieldLabel>
          <FieldLabel label={labels.confirmPassword}><PasswordInput name="confirmPassword" autoComplete="new-password" minLength={8} maxLength={72} showLabel={labels.showPassword} hideLabel={labels.hidePassword} required /></FieldLabel>
          <FieldLabel label={labels.language}><LanguageSelect /></FieldLabel>
          <label className="flex items-start gap-3 text-sm leading-5 text-[var(--text-secondary)]">
            <input name="terms" type="checkbox" required className="mt-1 size-4 accent-[var(--text-primary)]" />
            <span>{labels.termsConsent} <Link href="/terms" className="font-bold underline underline-offset-4">Termos</Link> · <Link href="/privacy" className="font-bold underline underline-offset-4">Privacidade</Link></span>
          </label>
          {error ? <p role="alert" className="text-sm font-semibold text-red-500">{error}</p> : null}
          <Button type="submit" disabled={loading}>{loading ? labels.loading : labels.registerAction}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
          {labels.hasAccount} <Link href="/login" className="font-bold underline underline-offset-4">{labels.loginAction}</Link>
        </p>
      </Card>
    </main>
  );
}
