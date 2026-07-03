"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") router.replace("/login");
  }, [router, status]);

  if (status !== "authenticated") {
    return (
      <main className="alfredPage grid min-h-dvh place-items-center px-5">
        <p className="text-sm font-semibold text-[var(--text-secondary)]">Carregando sua rotina…</p>
      </main>
    );
  }
  return children;
}
