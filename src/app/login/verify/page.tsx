"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/app/BrandMark";
import { useAuth } from "@/components/app/AuthProvider";
import { useTranslations } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input } from "@/components/ui/Form";
import { authApi } from "@/lib/authApi";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { clearPendingLoginChallenge, getPendingLoginChallenge, savePendingLoginChallenge, type PendingLoginChallenge } from "@/lib/session";

export default function VerifyLoginPage() {
  const labels = useTranslations("authFlow");
  const { completeLogin, status } = useAuth();
  const router = useRouter();
  const [challenge, setChallenge] = useState<PendingLoginChallenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resendWait, setResendWait] = useState(30);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
    const pending = getPendingLoginChallenge();
    queueMicrotask(() => setChallenge(pending));
  }, [router, status]);

  useEffect(() => {
    if (resendWait <= 0) return;
    const timer = window.setInterval(() => setResendWait((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendWait]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge) return;
    const data = new FormData(event.currentTarget);
    setLoading(true); setError(""); setNotice("");
    try {
      const tokens = await authApi.verifyLogin(challenge.challengeId, String(data.get("code")).replace(/\D/g, ""));
      await completeLogin(tokens);
      clearPendingLoginChallenge();
      router.replace("/dashboard");
    } catch (cause) {
      setError(getAuthErrorMessage(cause, labels));
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!challenge || resendWait > 0) return;
    setLoading(true); setError(""); setNotice("");
    try {
      const next = await authApi.resendLogin(challenge.challengeId);
      const pending = { challengeId: next.challenge_id, maskedEmail: next.masked_email, expiresAt: next.expires_at };
      savePendingLoginChallenge(pending);
      setChallenge(pending);
      setNotice(labels.loginCodeResent);
      setResendWait(30);
    } catch (cause) {
      setError(getAuthErrorMessage(cause, labels));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="alfredPage grid min-h-dvh place-items-center px-5 py-10">
      <Card className="w-full max-w-md">
        <BrandMark className="mb-6" />
        <h1 className="font-brand text-4xl font-semibold">{labels.loginCodeTitle}</h1>
        {challenge ? (
          <>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{labels.loginCodeSubtitle.replace("{email}", challenge.maskedEmail)}</p>
            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              <FieldLabel label={labels.loginCodeLabel}>
                <Input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} className="text-center text-2xl font-bold tracking-[0.35em]" autoFocus required />
              </FieldLabel>
              {notice ? <p role="status" className="text-sm font-semibold text-emerald-500">{notice}</p> : null}
              {error ? <p role="alert" className="text-sm font-semibold text-red-500">{error}</p> : null}
              <Button type="submit" disabled={loading}>{loading ? labels.loading : labels.confirmLoginCode}</Button>
              <Button type="button" variant="secondary" onClick={resend} disabled={loading || resendWait > 0}>
                {resendWait > 0 ? labels.resendWait.replace("{seconds}", String(resendWait)) : labels.resendLoginCode}
              </Button>
            </form>
          </>
        ) : (
          <div className="mt-5 grid gap-4">
            <p role="alert" className="text-sm font-semibold text-red-500">{labels.loginChallengeMissing}</p>
            <Link href="/login" className="text-center text-sm font-bold underline underline-offset-4">{labels.backToLogin}</Link>
          </div>
        )}
      </Card>
    </main>
  );
}
