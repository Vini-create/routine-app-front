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
import { appToApiLanguage } from "@/lib/api-contracts";
import { authApi } from "@/lib/authApi";
import { savePendingVerificationEmail } from "@/lib/session";

export default function RegisterPage() {
  const labels = useTranslations("authFlow");
  const { language } = useLanguage();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    if (password !== String(formData.get("confirmPassword"))) {
      setError(labels.passwordMismatch);
      return;
    }
    setError("");
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
        setError(cause instanceof ApiError ? cause.detail : labels.genericError);
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
          <FieldLabel label={labels.name}><Input name="displayName" minLength={2} maxLength={100} required /></FieldLabel>
          <FieldLabel label={labels.email}><Input name="email" type="email" autoComplete="email" required /></FieldLabel>
          <FieldLabel label={labels.password}><PasswordInput name="password" autoComplete="new-password" minLength={8} maxLength={72} showLabel={labels.showPassword} hideLabel={labels.hidePassword} required /></FieldLabel>
          <FieldLabel label={labels.confirmPassword}><PasswordInput name="confirmPassword" autoComplete="new-password" minLength={8} maxLength={72} showLabel={labels.showPassword} hideLabel={labels.hidePassword} required /></FieldLabel>
          <FieldLabel label={labels.language}><LanguageSelect /></FieldLabel>
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
