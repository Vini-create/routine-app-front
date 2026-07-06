"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DotWave } from "ldrs/react";
import { useTranslations } from "@/components/app/LanguageProvider";

const LandingMediaReadyContext = createContext<() => void>(() => undefined);

export function useLandingMediaReady() {
  return useContext(LandingMediaReadyContext);
}

export function LandingLoadGate({ children }: { children: React.ReactNode }) {
  const landing = useTranslations("landing");
  const [pageReady, setPageReady] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const markMediaReady = useCallback(() => setMediaReady(true), []);

  useEffect(() => {
    let cancelled = false;

    async function waitForPage() {
      if (document.readyState !== "complete") {
        await new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));
      }
      await document.fonts?.ready;
      if (!cancelled) setPageReady(true);
    }

    void waitForPage();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!pageReady || !mediaReady) return;
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => setRevealed(true));
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [mediaReady, pageReady]);

  useEffect(() => {
    const safetyTimeout = window.setTimeout(() => setRevealed(true), 8_000);
    return () => window.clearTimeout(safetyTimeout);
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const timeout = window.setTimeout(() => setLoaderVisible(false), 320);
    return () => window.clearTimeout(timeout);
  }, [revealed]);

  useEffect(() => {
    if (revealed) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = previousOverflow; };
  }, [revealed]);

  return (
    <LandingMediaReadyContext.Provider value={markMediaReady}>
      <div
        className={`transition-opacity duration-300 ${revealed ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!revealed}
      >
        {children}
      </div>
      {loaderVisible ? (
        <main
          className={`alfredPage fixed inset-0 z-[200] grid min-h-dvh place-items-center px-5 transition-opacity duration-300 ${revealed ? "pointer-events-none opacity-0" : "opacity-100"}`}
          role="status"
          aria-live="polite"
          aria-busy={!revealed}
        >
          <div className="grid justify-items-center gap-4 text-center">
            <DotWave size="47" speed="1" color="var(--text-primary)" />
            <p className="text-sm font-semibold text-[var(--text-secondary)]">{landing.loadingExperience}</p>
          </div>
        </main>
      ) : null}
    </LandingMediaReadyContext.Provider>
  );
}
