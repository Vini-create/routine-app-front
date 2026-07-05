"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/components/app/LanguageProvider";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
const availabilityListeners = new Set<(available: boolean) => void>();

function publishAvailability(available: boolean) {
  availabilityListeners.forEach((listener) => listener(available));
}

function isRunningStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches
    || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

function isIosDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function shouldOpenInChrome() {
  const userAgent = navigator.userAgent;
  const isAndroid = /Android/i.test(userAgent);
  const isChrome = /Chrome\//i.test(userAgent)
    && !/EdgA|OPR|Opera|SamsungBrowser|DuckDuckGo/i.test(userAgent);

  return isAndroid && !isChrome && !isRunningStandalone();
}

function openCurrentPageInChrome() {
  const { host, pathname, search, protocol } = window.location;
  const scheme = protocol.replace(":", "");
  const fallback = encodeURIComponent("https://play.google.com/store/apps/details?id=com.android.chrome");
  window.location.href = `intent://${host}${pathname}${search}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
}

export function InstallAppButton({
  className,
  labelClassName,
}: {
  className?: string;
  labelClassName?: string;
}) {
  const common = useTranslations("common");
  const [nativePromptAvailable, setNativePromptAvailable] = useState(false);
  const [iosInstallAvailable, setIosInstallAvailable] = useState(false);
  const [chromeRedirectAvailable, setChromeRedirectAvailable] = useState(false);
  const [iosInstructionsOpen, setIosInstructionsOpen] = useState(false);
  const [chromeConfirmationOpen, setChromeConfirmationOpen] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // Installation remains hidden if the browser cannot register the worker.
      });
    }

    const availabilityFrame = window.requestAnimationFrame(() => {
      const standalone = isRunningStandalone();
      setNativePromptAvailable(Boolean(deferredInstallPrompt) && !standalone);
      setIosInstallAvailable(isIosDevice() && !standalone);
      setChromeRedirectAvailable(shouldOpenInChrome());
    });
    availabilityListeners.add(setNativePromptAvailable);

    function handleInstallPrompt(event: Event) {
      event.preventDefault();
      deferredInstallPrompt = event as BeforeInstallPromptEvent;
      publishAvailability(!isRunningStandalone());
    }

    function handleInstalled() {
      deferredInstallPrompt = null;
      setIosInstallAvailable(false);
      setChromeRedirectAvailable(false);
      publishAvailability(false);
    }

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.cancelAnimationFrame(availabilityFrame);
      availabilityListeners.delete(setNativePromptAvailable);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function install() {
    const prompt = deferredInstallPrompt;
    if (!prompt) {
      if (iosInstallAvailable) setIosInstructionsOpen(true);
      else if (chromeRedirectAvailable) setChromeConfirmationOpen(true);
      return;
    }

    try {
      await prompt.prompt();
      await prompt.userChoice;
    } finally {
      deferredInstallPrompt = null;
      publishAvailability(false);
    }
  }

  if (!nativePromptAvailable && !iosInstallAvailable && !chromeRedirectAvailable) return null;

  return (
    <>
      <button
        type="button"
        onClick={install}
        className={cn(
          "installAppButton inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-standard)] px-3 text-xs font-bold text-[var(--text-primary)] shadow-soft backdrop-blur-xl transition hover:-translate-y-px hover:bg-[var(--surface-focus)]",
          className,
        )}
        aria-label={common.installApp}
        title={common.installApp}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v11m0 0 4-4m-4 4-4-4M5 16.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2.5" />
        </svg>
        <span className={labelClassName}>{common.installApp}</span>
      </button>

      {chromeConfirmationOpen ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-end bg-black/55 p-4 backdrop-blur-md sm:place-items-center"
          onClick={() => setChromeConfirmationOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="chrome-install-title"
            className="alfredModalSurface w-full max-w-md rounded-[1.75rem] border p-5 text-left text-[var(--text-primary)] shadow-focus"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-micro">Winperium</p>
                <h2 id="chrome-install-title" className="mt-2 text-xl font-black">{common.installChromeTitle}</h2>
              </div>
              <button
                type="button"
                aria-label={common.close}
                onClick={() => setChromeConfirmationOpen(false)}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--surface-standard)] text-xl text-[var(--text-secondary)]"
              >
                ×
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{common.installChromeDescription}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChromeConfirmationOpen(false)}
                className="metallicButtonSecondary min-h-11 rounded-[1.2rem] border px-4 text-sm font-bold"
              >
                {common.notNow}
              </button>
              <button
                type="button"
                onClick={openCurrentPageInChrome}
                className="metallicButton min-h-11 rounded-[1.2rem] px-4 text-sm font-bold"
              >
                {common.openInChrome}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {iosInstructionsOpen ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-end bg-black/55 p-4 backdrop-blur-md sm:place-items-center"
          onClick={() => setIosInstructionsOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="alfredModalSurface w-full max-w-md rounded-[1.75rem] border p-5 text-left text-[var(--text-primary)] shadow-focus"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-micro">Winperium</p>
                <h2 id="ios-install-title" className="mt-2 text-xl font-black">{common.installIosTitle}</h2>
              </div>
              <button
                type="button"
                aria-label={common.close}
                onClick={() => setIosInstructionsOpen(false)}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--surface-standard)] text-xl text-[var(--text-secondary)]"
              >
                ×
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{common.installIosDescription}</p>
            <ol className="mt-5 grid gap-3">
              {[common.installIosStepShare, common.installIosStepHome, common.installIosStepOpen].map((step, index) => (
                <li key={step} className="grid grid-cols-[2rem_1fr] items-center gap-3 rounded-2xl bg-[var(--surface-ambient)] p-3 text-sm font-semibold">
                  <span className="grid size-8 place-items-center rounded-full bg-[var(--text-primary)] text-xs font-black text-[var(--background-primary)]">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => setIosInstructionsOpen(false)}
              className="metallicButton mt-5 min-h-11 w-full rounded-[1.2rem] px-5 text-sm font-bold"
            >
              {common.understood}
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}
