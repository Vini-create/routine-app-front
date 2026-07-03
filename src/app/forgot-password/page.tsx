"use client";

import { FormEvent, useState } from "react";
import { BrandMark } from "@/components/app/BrandMark";
import { useTranslations } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input } from "@/components/ui/Form";
import { ApiError } from "@/lib/api";
import { authApi } from "@/lib/authApi";

export default function ForgotPasswordPage() {
  const labels = useTranslations("authFlow");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const email = String(new FormData(event.currentTarget).get("email"));
    try { await authApi.forgotPassword(email); setMessage(labels.forgotSuccess); }
    catch (cause) { setError(cause instanceof ApiError ? cause.detail : labels.genericError); }
    finally { setLoading(false); }
  }
  return <main className="alfredPage grid min-h-dvh place-items-center px-5 py-10"><Card className="w-full max-w-md"><BrandMark className="mb-6" /><h1 className="font-brand text-4xl font-semibold">{labels.forgotTitle}</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">{labels.forgotSubtitle}</p><form onSubmit={onSubmit} className="mt-6 grid gap-4"><FieldLabel label={labels.email}><Input name="email" type="email" required /></FieldLabel>{message ? <p className="text-sm font-semibold text-emerald-500">{message}</p> : null}{error ? <p role="alert" className="text-sm font-semibold text-red-500">{error}</p> : null}<Button type="submit" disabled={loading}>{loading ? labels.loading : labels.sendLink}</Button><Button href="/login" variant="secondary">{labels.backToLogin}</Button></form></Card></main>;
}
