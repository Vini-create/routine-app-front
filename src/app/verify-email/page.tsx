"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BrandMark } from "@/components/app/BrandMark";
import { useTranslations } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/lib/api";
import { authApi } from "@/lib/authApi";

function VerifyEmailContent() {
  const labels = useTranslations("authFlow");
  const params = useSearchParams();
  const token = params.get("token");
  const [message, setMessage] = useState(params.get("registered") ? labels.checkInbox : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function verify() {
    if (!token) return;
    setLoading(true); setError("");
    try {
      await authApi.verifyEmail(token);
      setMessage(labels.verifiedSuccess);
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
        <Button href="/login" variant="secondary">{labels.backToLogin}</Button>
      </div>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return <main className="alfredPage grid min-h-dvh place-items-center px-5 py-10"><Suspense><VerifyEmailContent /></Suspense></main>;
}
