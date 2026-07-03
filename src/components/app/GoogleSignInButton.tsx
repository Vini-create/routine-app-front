"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useLanguage, useTranslations } from "./LanguageProvider";
import { authApi } from "@/lib/authApi";
import { appToApiLanguage } from "@/lib/api-contracts";
import { getAuthErrorMessage } from "@/lib/authErrors";

type GoogleCredentialResponse = { credential?: string };
type GoogleAccounts = {
  id: {
    initialize: (options: Record<string, unknown>) => void;
    renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
  };
};

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

const scriptId = "google-identity-services";

export function GoogleSignInButton({ mode }: { mode: "signin" | "signup" }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const labels = useTranslations("authFlow");
  const { language } = useLanguage();
  const { completeLogin } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const renewalRef = useRef<number | null>(null);
  const activeRef = useRef(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [generation, setGeneration] = useState(0);

  const configureButton = useCallback(async () => {
    if (!clientId || !window.google || !containerRef.current) return;
    try {
      const challenge = await authApi.googleChallenge();
      if (!activeRef.current || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        nonce: challenge.nonce,
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: "popup",
        context: mode === "signup" ? "signup" : "signin",
        callback: async (response: GoogleCredentialResponse) => {
          if (!response.credential) {
            setError(labels.googleFailed);
            return;
          }
          setLoading(true);
          setError("");
          try {
            const tokens = await authApi.googleLogin(
              challenge.challenge_id,
              response.credential,
              appToApiLanguage[language],
            );
            await completeLogin(tokens);
            router.replace("/dashboard");
          } catch (cause) {
            setError(getAuthErrorMessage(cause, labels));
          } finally {
            setLoading(false);
          }
        },
      });
      containerRef.current.replaceChildren();
      window.google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        text: mode === "signup" ? "signup_with" : "signin_with",
        logo_alignment: "left",
        locale: language,
        width: Math.min(containerRef.current.clientWidth || 380, 380),
      });
      if (renewalRef.current) window.clearTimeout(renewalRef.current);
      renewalRef.current = window.setTimeout(() => setGeneration((value) => value + 1), 4 * 60 * 1000);
    } catch (cause) {
      if (activeRef.current) setError(getAuthErrorMessage(cause, labels));
    }
  }, [clientId, completeLogin, labels, language, mode, router]);

  useEffect(() => {
    activeRef.current = true;
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    const onReady = () => void configureButton();
    if (window.google) {
      onReady();
    } else if (existing) {
      existing.addEventListener("load", onReady, { once: true });
    } else {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", onReady, { once: true });
      script.addEventListener("error", () => setError(labels.googleUnavailable), { once: true });
      document.head.appendChild(script);
    }
    return () => {
      activeRef.current = false;
      existing?.removeEventListener("load", onReady);
      if (renewalRef.current) window.clearTimeout(renewalRef.current);
    };
  }, [configureButton, generation, labels.googleUnavailable]);

  if (!clientId) return <p role="status" className="mt-5 text-center text-sm text-[var(--text-tertiary)]">{labels.googleUnavailable}</p>;

  return (
    <div className="mt-6 grid gap-2">
      <div ref={containerRef} className={`flex min-h-11 justify-center ${loading ? "pointer-events-none opacity-60" : ""}`} aria-busy={loading} />
      {error ? <p role="alert" className="text-center text-sm font-semibold text-red-500">{error}</p> : null}
    </div>
  );
}
