"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/app/BrandMark";
import { useAuth } from "@/components/app/AuthProvider";
import { useTranslations } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input, PasswordInput } from "@/components/ui/Form";
import { ApiError } from "@/lib/api";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { savePendingVerificationEmail } from "@/lib/session";

export default function LoginPage() {
  const labels = useTranslations("authFlow");
  const { login, status } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [router, status]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    queueMicrotask(() => {
      if (params.get("verified")) setNotice(labels.verifiedSuccess);
      if (params.get("passwordReset")) setNotice(labels.resetSuccess);
    });
    if (params.size) window.history.replaceState({}, "", "/login");
  }, [labels]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    setError("");
    setLoading(true);
    try {
      await login({ email, password: String(formData.get("password")) });
      router.replace("/dashboard");
    } catch (cause) {
      const message = getAuthErrorMessage(cause, labels);
      if (cause instanceof ApiError && /not verified|não verificado/i.test(cause.detail)) {
        savePendingVerificationEmail(email);
        router.push("/verify-email");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="alfredPage grid min-h-dvh place-items-center px-5 py-10">
      <Card className="w-full max-w-md">
        <BrandMark className="mb-6" />
        <h1 className="font-brand text-4xl font-semibold tracking-normal">{labels.loginTitle}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{labels.loginSubtitle}</p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <FieldLabel label={labels.email}><Input name="email" type="email" autoComplete="email" required /></FieldLabel>
          <FieldLabel label={labels.password}><PasswordInput name="password" autoComplete="current-password" minLength={8} maxLength={72} showLabel={labels.showPassword} hideLabel={labels.hidePassword} required /></FieldLabel>
          {notice ? <p role="status" className="text-sm font-semibold text-emerald-500">{notice}</p> : null}
          {error ? <p role="alert" className="text-sm font-semibold text-red-500">{error}</p> : null}
          <div className="text-right"><Link href="/forgot-password" className="text-sm font-bold underline underline-offset-4">{labels.forgotLink}</Link></div>
          <Button type="submit" disabled={loading}>{loading ? labels.loading : labels.loginAction}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
          {labels.noAccount} <Link href="/register" className="font-bold text-[var(--text-primary)] underline underline-offset-4">{labels.registerAction}</Link>
        </p>
      </Card>
    </main>
  );
}
