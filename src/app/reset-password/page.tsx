"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { BrandMark } from "@/components/app/BrandMark";
import { useTranslations } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, PasswordInput } from "@/components/ui/Form";
import { ApiError } from "@/lib/api";
import { authApi } from "@/lib/authApi";

function ResetPasswordContent() {
  const labels = useTranslations("authFlow");
  const token = useSearchParams().get("token");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(token ? "" : labels.invalidResetToken);
  const [loading, setLoading] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password !== String(data.get("confirmPassword"))) { setError(labels.passwordMismatch); return; }
    if (!token) return;
    setLoading(true); setError("");
    try { await authApi.resetPassword(token, password); setMessage(labels.resetSuccess); }
    catch (cause) { setError(cause instanceof ApiError ? cause.detail : labels.genericError); }
    finally { setLoading(false); }
  }
  return <Card className="w-full max-w-md"><BrandMark className="mb-6" /><h1 className="font-brand text-4xl font-semibold">{labels.resetTitle}</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">{labels.resetSubtitle}</p><form onSubmit={onSubmit} className="mt-6 grid gap-4"><FieldLabel label={labels.newPassword}><PasswordInput name="password" minLength={8} maxLength={72} showLabel={labels.showPassword} hideLabel={labels.hidePassword} required /></FieldLabel><FieldLabel label={labels.confirmPassword}><PasswordInput name="confirmPassword" minLength={8} maxLength={72} showLabel={labels.showPassword} hideLabel={labels.hidePassword} required /></FieldLabel>{message ? <p className="text-sm font-semibold text-emerald-500">{message}</p> : null}{error ? <p role="alert" className="text-sm font-semibold text-red-500">{error}</p> : null}<Button type="submit" disabled={loading || !token}>{loading ? labels.loading : labels.resetAction}</Button><Button href="/login" variant="secondary">{labels.backToLogin}</Button></form></Card>;
}

export default function ResetPasswordPage() {
  return <main className="alfredPage grid min-h-dvh place-items-center px-5 py-10"><Suspense><ResetPasswordContent /></Suspense></main>;
}
