"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { clearSession } from "@/lib/session";
import { Button } from "@/components/ui/Button";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (status === "anonymous") router.replace("/login");
  }, [router, status]);

  useEffect(() => {
    if (status !== "loading") return;
    const timeout = window.setTimeout(() => setSlow(true), 4_000);
    return () => window.clearTimeout(timeout);
  }, [status]);

  if (status !== "authenticated") {
    return (
      <main className="alfredPage grid min-h-dvh place-items-center px-5">
        <div className="grid max-w-sm gap-4 text-center">
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            {slow ? "A conexão está demorando mais que o esperado." : "Carregando sua rotina…"}
          </p>
          {slow ? (
            <Button
              variant="secondary"
              onClick={() => {
                clearSession();
                window.location.replace("/login");
              }}
            >
              Voltar ao login
            </Button>
          ) : null}
        </div>
      </main>
    );
  }
  return children;
}
