"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DotWave } from "ldrs/react";
import { useTranslations } from "@/components/app/LanguageProvider";

type LandingMediaLoading = {
  markReady: () => void;
  reportProgress: (progress: number | null) => void;
};

const LandingMediaReadyContext = createContext<LandingMediaLoading>({
  markReady: () => undefined,
  reportProgress: () => undefined,
});

export function useLandingMediaReady() {
  return useContext(LandingMediaReadyContext);
}

export function LandingLoadGate({ children }: { children: React.ReactNode }) {
  const landing = useTranslations("landing");
  const [pageReady, setPageReady] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [mediaProgress, setMediaProgress] = useState<number | null>(0);
  const [revealed, setRevealed] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const markMediaReady = useCallback(() => setMediaReady(true), []);
  const reportProgress = useCallback((progress: number | null) => {
    setMediaProgress(progress === null ? null : Math.min(1, Math.max(0, progress)));
  }, []);
  const mediaLoading = useMemo(() => ({ markReady: markMediaReady, reportProgress }), [markMediaReady, reportProgress]);

  useEffect(() => {
    let cancelled = false;
    const readinessTimeout = window.setTimeout(() => {
      if (!cancelled) setPageReady(true);
    }, 5_000);

    async function waitForPage() {
      if (document.readyState !== "complete") {
        await new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));
      }
      await document.fonts?.ready;
      if (!cancelled) {
        window.clearTimeout(readinessTimeout);
        setPageReady(true);
      }
    }

    void waitForPage();
    return () => {
      cancelled = true;
      window.clearTimeout(readinessTimeout);
    };
  }, []);

  useEffect(() => {
    if (!pageReady || !mediaReady) return;
    const revealTimeout = window.setTimeout(() => setRevealed(true), 0);
    return () => window.clearTimeout(revealTimeout);
  }, [mediaReady, pageReady]);

  useEffect(() => {
    const safetyTimeout = window.setTimeout(() => setRevealed(true), 45_000);
    return () => window.clearTimeout(safetyTimeout);
  }, []);

  useEffect(() => {
    if (!loaderVisible || landing.loadingMessages.length < 2) return;
    let messageTimeout = 0;

    const scheduleNextMessage = () => {
      const delay = 2_200 + Math.round(Math.random() * 1_400);
      messageTimeout = window.setTimeout(() => {
        setLoadingMessageIndex((current) => {
          const offset = 1 + Math.floor(Math.random() * (landing.loadingMessages.length - 1));
          return (current + offset) % landing.loadingMessages.length;
        });
        scheduleNextMessage();
      }, delay);
    };

    scheduleNextMessage();
    return () => window.clearTimeout(messageTimeout);
  }, [landing.loadingMessages, loaderVisible]);

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
    <LandingMediaReadyContext.Provider value={mediaLoading}>
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
            <p
              key={loadingMessageIndex}
              className="landingLoadingPhrase min-h-5 max-w-xs text-xs text-white/45"
              aria-hidden="true"
            >
              {landing.loadingMessages[loadingMessageIndex % landing.loadingMessages.length]}
            </p>
            <div className="h-px w-56 overflow-hidden bg-white/10" aria-hidden="true">
              <span
                className="block h-full bg-white/80 transition-[width] duration-200"
                style={{ width: mediaProgress === null ? "18%" : `${Math.max(3, mediaProgress * 100)}%` }}
              />
            </div>
            <p className="min-h-4 text-[0.64rem] font-bold tracking-[0.16em] text-white/35" aria-hidden="true">
              {mediaProgress === null ? landing.loadingFilm : `${Math.round(mediaProgress * 100)}%`}
            </p>
          </div>
        </main>
      ) : null}
    </LandingMediaReadyContext.Provider>
  );
}
