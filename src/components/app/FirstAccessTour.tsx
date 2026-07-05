"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { firstAccessTourCopy } from "@/data/firstAccessTour";
import {
  clearFirstAccessTourOffer,
  clearFirstAccessTourProgress,
  firstAccessTourStartEvent,
  hasPendingFirstAccessTourOffer,
  readFirstAccessTourProgress,
  saveFirstAccessTourProgress,
} from "@/lib/firstAccessTour";
import { useAuth } from "./AuthProvider";
import { useLanguage } from "./LanguageProvider";

export function FirstAccessTour() {
  const { status, user } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const primaryActionRef = useRef<HTMLButtonElement>(null);
  const [invitationOpen, setInvitationOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const copy = firstAccessTourCopy[language];
  const totalSteps = copy.steps.length;
  const step = currentIndex === null ? null : copy.steps[currentIndex];

  useEffect(() => {
    if (status !== "authenticated" || !user) return;
    const frame = window.requestAnimationFrame(() => {
      setInvitationOpen(hasPendingFirstAccessTourOffer());
      setCurrentIndex(readFirstAccessTourProgress(totalSteps));
    });

    function startRequestedTour() {
      setInvitationOpen(false);
      setCurrentIndex(readFirstAccessTourProgress(totalSteps) ?? 0);
    }

    window.addEventListener(firstAccessTourStartEvent, startRequestedTour);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(firstAccessTourStartEvent, startRequestedTour);
    };
  }, [status, totalSteps, user]);

  useEffect(() => {
    if (!step || pathname === step.route) return;
    router.replace(step.route);
  }, [pathname, router, step]);

  useEffect(() => {
    if (!step && !invitationOpen) return;
    const frame = window.requestAnimationFrame(() => primaryActionRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [invitationOpen, step]);

  if (!user || (!invitationOpen && (!step || currentIndex === null))) return null;

  function goToStep(index: number) {
    saveFirstAccessTourProgress(index);
    setCurrentIndex(index);
    router.replace(copy.steps[index].route);
  }

  function finish(destination?: string) {
    clearFirstAccessTourProgress();
    setCurrentIndex(null);
    if (destination) router.replace(destination);
  }

  function startTour() {
    clearFirstAccessTourOffer();
    setInvitationOpen(false);
    saveFirstAccessTourProgress(0);
    setCurrentIndex(0);
    router.replace(copy.steps[0].route);
  }

  function declineInvitation() {
    clearFirstAccessTourOffer();
    setInvitationOpen(false);
  }

  if (invitationOpen) {
    return (
      <div
        className="fixed inset-0 z-[100] grid items-end bg-black/58 p-3 backdrop-blur-[3px] sm:place-items-center sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-access-invitation-title"
        aria-describedby="first-access-invitation-description"
      >
        <section className="alfredModalSurface w-full max-w-lg rounded-[1.8rem] border border-[var(--border-medium)] bg-[var(--surface-solid)] p-5 shadow-focus sm:p-6">
          <div className="grid size-12 place-items-center rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-ambient)] text-[var(--text-primary)] shadow-soft" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42m0-12.72-1.42 1.42M7.06 16.94l-1.42 1.42" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <p className="label-micro mt-5">{copy.invitationEyebrow}</p>
          <h2 id="first-access-invitation-title" className="mt-2 break-words font-display text-[2rem] font-light uppercase leading-[0.95] text-[var(--text-primary)] sm:text-4xl">
            {copy.invitationTitle}
          </h2>
          <p id="first-access-invitation-description" className="mt-3 text-sm leading-6 text-[var(--text-secondary)] sm:text-base sm:leading-7">
            {copy.invitationDescription}
          </p>
          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            <button type="button" onClick={declineInvitation} className="metallicButtonSecondary min-h-11 rounded-[1.2rem] border px-4 text-sm font-bold">
              {copy.invitationDecline}
            </button>
            <button ref={primaryActionRef} type="button" onClick={startTour} className="metallicButton min-h-11 rounded-[1.2rem] px-4 text-sm font-bold">
              {copy.invitationAccept}
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (!step || currentIndex === null) return null;

  const isLastStep = currentIndex === totalSteps - 1;
  const percentage = ((currentIndex + 1) / totalSteps) * 100;

  return (
    <div
      className="fixed inset-0 z-[100] grid items-end bg-black/58 p-3 backdrop-blur-[3px] sm:place-items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-access-tour-title"
      aria-describedby="first-access-tour-description"
    >
      <section className="alfredModalSurface relative w-full max-w-lg overflow-hidden rounded-[1.8rem] border border-[var(--border-medium)] bg-[var(--surface-solid)] shadow-focus">
        <div className="h-1.5 bg-[var(--surface-ambient)]">
          <div
            className="h-full rounded-r-full bg-[var(--text-primary)] transition-[width] duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="label-micro">{copy.eyebrow}</p>
              <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                {step.area} · {copy.progress(currentIndex + 1, totalSteps)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => finish()}
              className="shrink-0 rounded-full px-3 py-2 text-xs font-bold text-[var(--text-secondary)] transition hover:bg-[var(--surface-ambient)] hover:text-[var(--text-primary)]"
            >
              {copy.skip}
            </button>
          </div>

          <h2 id="first-access-tour-title" className="mt-5 break-words font-display text-[2rem] font-light uppercase leading-[0.95] text-[var(--text-primary)] sm:text-4xl">
            {step.title}
          </h2>
          <p id="first-access-tour-description" className="mt-3 text-sm leading-6 text-[var(--text-secondary)] sm:text-base sm:leading-7">
            {step.description}
          </p>

          <div className="mt-5 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-ambient)] p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{copy.tipLabel}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-primary)]">{step.tip}</p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-1.5" aria-hidden="true">
            {copy.steps.map((item, index) => (
              <span
                key={item.route}
                className={`h-1.5 rounded-full transition-all ${index === currentIndex ? "w-6 bg-[var(--text-primary)]" : index < currentIndex ? "w-2 bg-[var(--text-secondary)]" : "w-2 bg-[var(--border-strong)]"}`}
              />
            ))}
          </div>

          <div className="mt-5 grid grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] gap-2.5">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => goToStep(currentIndex - 1)}
              className="metallicButtonSecondary min-h-11 rounded-[1.2rem] border px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copy.previous}
            </button>
            <button
              ref={primaryActionRef}
              type="button"
              onClick={() => isLastStep ? finish("/dashboard") : goToStep(currentIndex + 1)}
              className="metallicButton min-h-11 rounded-[1.2rem] px-4 text-sm font-bold"
            >
              {isLastStep ? copy.finish : copy.next}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
