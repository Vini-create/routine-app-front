"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { BrandMark } from "@/components/app/BrandMark";
import { useTranslations } from "@/components/app/LanguageProvider";
import { usePublicOnly } from "@/components/app/usePublicOnly";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, PasswordInput } from "@/components/ui/Form";
import { getAuthErrorMessage, getFieldIssue } from "@/lib/authErrors";
import { authApi } from "@/lib/authApi";

function ResetPasswordContent() {
  const labels = useTranslations("authFlow");
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(token ? "" : labels.invalidResetToken);
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  usePublicOnly();

  useEffect(() => {
    if (token) window.history.replaceState({}, "", "/reset-password");
  }, [token]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password !== String(data.get("confirmPassword"))) { setError(labels.passwordMismatch); return; }
    if (!token) return;
    setLoading(true); setError(""); setPasswordError("");
    try {
      await authApi.resetPassword(token, password);
      setMessage(labels.resetSuccess);
      window.setTimeout(() => router.replace("/login?passwordReset=1"), 1_800);
    } catch (cause) {
      setPasswordError(getFieldIssue(cause, "new_password"));
      setError(getAuthErrorMessage(cause, labels));
    } finally { setLoading(false); }
  }

  return (
    <Card className="w-full max-w-md">
      <BrandMark className="mb-6" />
      <h1 className="font-brand text-4xl font-semibold">{labels.resetTitle}</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{labels.resetSubtitle}</p>
      {!message ? (
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <FieldLabel label={labels.newPassword}><PasswordInput name="password" autoComplete="new-password" minLength={8} maxLength={72} aria-invalid={Boolean(passwordError)} showLabel={labels.showPassword} hideLabel={labels.hidePassword} required /><span className="text-xs font-normal text-[var(--text-tertiary)]">{labels.passwordHint}</span>{passwordError ? <span className="text-xs text-red-500">{passwordError}</span> : null}</FieldLabel>
          <FieldLabel label={labels.confirmPassword}><PasswordInput name="confirmPassword" autoComplete="new-password" minLength={8} maxLength={72} showLabel={labels.showPassword} hideLabel={labels.hidePassword} required /></FieldLabel>
          {error ? <p role="alert" className="text-sm font-semibold text-red-500">{error}</p> : null}
          <Button type="submit" disabled={loading || !token}>{loading ? labels.loading : labels.resetAction}</Button>
          <Button href="/login" variant="secondary">{labels.backToLogin}</Button>
        </form>
      ) : (
        <div className="mt-6 grid gap-3 text-center"><p role="status" className="text-sm font-semibold text-emerald-500">{message}</p><p className="text-xs text-[var(--text-tertiary)]">{labels.redirecting}</p><Button href="/login">{labels.backToLogin}</Button></div>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return <main className="alfredPage grid min-h-dvh place-items-center px-5 py-10"><Suspense><ResetPasswordContent /></Suspense></main>;
}
