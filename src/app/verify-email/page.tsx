"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/app/BrandMark";
import { useTranslations } from "@/components/app/LanguageProvider";
import { usePublicOnly } from "@/components/app/usePublicOnly";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input } from "@/components/ui/Form";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { authApi } from "@/lib/authApi";
import { clearPendingVerificationEmail, getPendingVerificationEmail, savePendingVerificationEmail } from "@/lib/session";

const resendCooldownSeconds = 60;

function VerifyEmailContent() {
  const labels = useTranslations("authFlow");
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const attemptedToken = useRef(false);
  const [message, setMessage] = useState(params.get("registered") || params.get("existing") ? labels.checkInbox : "");
  const [error, setError] = useState(params.get("delivery") === "failed" ? labels.deliveryFailed : "");
  const [loading, setLoading] = useState(Boolean(token));
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  usePublicOnly();

  useEffect(() => {
    queueMicrotask(() => setEmail(getPendingVerificationEmail()));
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1_000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!token || attemptedToken.current) return;
    attemptedToken.current = true;
    window.history.replaceState({}, "", "/verify-email");
    authApi.verifyEmail(token)
      .then(() => {
        clearPendingVerificationEmail();
        setVerified(true);
        setMessage(labels.verifiedSuccess);
        window.setTimeout(() => router.replace("/login?verified=1"), 1_800);
      })
      .catch((cause) => setError(getAuthErrorMessage(cause, labels)))
      .finally(() => setLoading(false));
  }, [labels, router, token]);

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || cooldown > 0) return;
    setLoading(true); setError(""); setMessage("");
    try {
      await authApi.resendVerification(email);
      savePendingVerificationEmail(email);
      setMessage(labels.resendSuccess);
      setCooldown(resendCooldownSeconds);
    } catch (cause) {
      setError(getAuthErrorMessage(cause, labels));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md text-center">
      <BrandMark className="mb-6 justify-center" />
      <h1 className="font-brand text-4xl font-semibold">{labels.verifyTitle}</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{token ? labels.verifySubtitle : labels.checkInbox}</p>
      {loading && token ? <p role="status" className="mt-5 text-sm font-semibold text-[var(--text-secondary)]">{labels.loading}</p> : null}
      {message ? <p role="status" className="mt-5 text-sm font-semibold text-emerald-500">{message}</p> : null}
      {verified ? <p className="mt-2 text-xs text-[var(--text-tertiary)]">{labels.redirecting}</p> : null}
      {error ? <p role="alert" className="mt-5 text-sm font-semibold text-red-500">{error}</p> : null}
      <div className="mt-6 grid gap-3">
        {!verified ? (
          <form onSubmit={resend} className="grid gap-3 rounded-2xl border border-[var(--border-soft)] p-4 text-left">
            <FieldLabel label={labels.email}>
              <Input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </FieldLabel>
            <Button type="submit" variant="secondary" disabled={loading || cooldown > 0}>
              {loading ? labels.loading : cooldown > 0 ? labels.resendWait.replace("{seconds}", String(cooldown)) : labels.resendAction}
            </Button>
          </form>
        ) : null}
        <Button href="/login" variant="secondary">{labels.backToLogin}</Button>
      </div>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return <main className="alfredPage grid min-h-dvh place-items-center px-5 py-10"><Suspense><VerifyEmailContent /></Suspense></main>;
}
