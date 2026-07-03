"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { BrandMark } from "@/components/app/BrandMark";
import { useTranslations } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input } from "@/components/ui/Form";
import { ApiError } from "@/lib/api";
import { authApi } from "@/lib/authApi";
import { clearPendingVerificationEmail, getPendingVerificationEmail, savePendingVerificationEmail } from "@/lib/session";

function VerifyEmailContent() {
  const labels = useTranslations("authFlow");
  const params = useSearchParams();
  const token = params.get("token");
  const [message, setMessage] = useState(params.get("registered") || params.get("existing") ? labels.checkInbox : "");
  const [error, setError] = useState(params.get("delivery") === "failed" ? labels.deliveryFailed : "");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    let active = true;
    const pendingEmail = getPendingVerificationEmail();
    queueMicrotask(() => { if (active) setEmail(pendingEmail); });
    return () => { active = false; };
  }, []);

  async function verify() {
    if (!token) return;
    setLoading(true); setError("");
    try {
      await authApi.verifyEmail(token);
      clearPendingVerificationEmail();
      setMessage(labels.verifiedSuccess);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.detail : labels.genericError);
    } finally { setLoading(false); }
  }

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    setLoading(true); setError(""); setMessage("");
    try {
      await authApi.resendVerification(email);
      savePendingVerificationEmail(email);
      setMessage(labels.resendSuccess);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.detail : labels.genericError);
    } finally { setLoading(false); }
  }

  return (
    <Card className="w-full max-w-md text-center">
      <BrandMark className="mb-6 justify-center" />
      <h1 className="font-brand text-4xl font-semibold">{labels.verifyTitle}</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{token ? labels.verifySubtitle : labels.checkInbox}</p>
      {message ? <p className="mt-5 text-sm font-semibold text-emerald-500">{message}</p> : null}
      {error ? <p role="alert" className="mt-5 text-sm font-semibold text-red-500">{error}</p> : null}
      <div className="mt-6 grid gap-3">
        {token && !message ? <Button onClick={verify} disabled={loading}>{loading ? labels.loading : labels.verifyAction}</Button> : null}
        <form onSubmit={resend} className="grid gap-3 rounded-2xl border border-[var(--border-soft)] p-4 text-left">
          <FieldLabel label={labels.email}>
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </FieldLabel>
          <Button type="submit" variant="secondary" disabled={loading}>{loading ? labels.loading : labels.resendAction}</Button>
        </form>
        <Button href="/login" variant="secondary">{labels.backToLogin}</Button>
      </div>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return <main className="alfredPage grid min-h-dvh place-items-center px-5 py-10"><Suspense><VerifyEmailContent /></Suspense></main>;
}
