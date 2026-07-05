"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import { expandedFirstAccessTourSteps, firstAccessTourCopy } from "@/data/firstAccessTour";
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
  const [targetRect, setTargetRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const copy = firstAccessTourCopy[language];
  const steps = expandedFirstAccessTourSteps(copy);
  const totalSteps = steps.length;
  const step = currentIndex === null ? null : steps[currentIndex];

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
    if (!step || pathname !== step.route) return;
    const activeStep = step;
    let target: HTMLElement | null = null;
    let observer: ResizeObserver | null = null;
    let settleTimer = 0;

    function findTarget() {
      const matches = Array.from(document.querySelectorAll<HTMLElement>(activeStep.target ?? "main"));
      return matches.find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }) ?? document.querySelector<HTMLElement>("main");
    }

    function updateTarget() {
      target = findTarget();
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const padding = 8;
      const top = Math.max(padding, rect.top - padding);
      const left = Math.max(padding, rect.left - padding);
      const right = Math.min(window.innerWidth - padding, rect.right + padding);
      const bottom = Math.min(window.innerHeight - padding, rect.bottom + padding);
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      setTargetRect({ top, left, width: Math.max(0, right - left), height: Math.max(0, bottom - top) });
    }

    const revealFrame = window.requestAnimationFrame(() => {
      target = findTarget();
      target?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      target?.classList.add("firstAccessTourTarget");
      updateTarget();
      settleTimer = window.setTimeout(updateTarget, 380);
      if (target && "ResizeObserver" in window) {
        observer = new ResizeObserver(updateTarget);
        observer.observe(target);
      }
    });

    window.addEventListener("resize", updateTarget);
    window.addEventListener("scroll", updateTarget, true);
    return () => {
      window.cancelAnimationFrame(revealFrame);
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget, true);
      observer?.disconnect();
      target?.classList.remove("firstAccessTourTarget");
      setTargetRect(null);
    };
  }, [pathname, step]);

  useEffect(() => {
    if (!step && !invitationOpen) return;
    const frame = window.requestAnimationFrame(() => primaryActionRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [invitationOpen, step]);

  if (!user || (!invitationOpen && (!step || currentIndex === null))) return null;

  function goToStep(index: number) {
    saveFirstAccessTourProgress(index);
    setCurrentIndex(index);
    router.replace(steps[index].route);
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
    router.replace(steps[0].route);
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
        <section className="alfredModalSurface max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-[1.8rem] border border-[var(--border-medium)] bg-[var(--surface-solid)] p-5 shadow-focus sm:max-h-[calc(100dvh-3rem)] sm:p-6">
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
  const popoverStyle: CSSProperties = (() => {
    const gap = 16;
    const edge = 12;
    if (!targetRect || viewport.width < 768) {
      const targetIsAboveCenter = !targetRect || targetRect.top + targetRect.height / 2 < viewport.height / 2;
      return {
        left: edge,
        right: edge,
        ...(targetIsAboveCenter ? { bottom: edge } : { top: edge }),
        maxHeight: "min(52dvh, 500px)",
      };
    }

    const width = Math.min(440, viewport.width - edge * 2);
    const availableRight = viewport.width - (targetRect.left + targetRect.width);
    const top = Math.min(Math.max(edge, targetRect.top), Math.max(edge, viewport.height - 520));
    if (availableRight >= width + gap) return { width, left: targetRect.left + targetRect.width + gap, top, maxHeight: "calc(100dvh - 24px)" };
    if (targetRect.left >= width + gap) return { width, left: targetRect.left - width - gap, top, maxHeight: "calc(100dvh - 24px)" };
    return { width, left: (viewport.width - width) / 2, bottom: edge, maxHeight: "min(54dvh, 520px)" };
  })();

  return (
    <>
      {targetRect ? (
        <div
          aria-hidden="true"
          className="firstAccessTourSpotlight pointer-events-none fixed z-[98] rounded-[1.6rem] border-2 border-white/80"
          style={targetRect}
        />
      ) : (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[98] bg-black/55" />
      )}
      <section
        role="dialog"
        aria-modal="false"
        aria-labelledby="first-access-tour-title"
        aria-describedby="first-access-tour-description"
        style={popoverStyle}
        className="alfredModalSurface fixed z-[100] w-auto overflow-y-auto rounded-[1.55rem] border border-[var(--border-medium)] bg-[var(--surface-solid)] shadow-focus"
      >
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

          <div className="mt-5 flex items-center justify-center gap-1" aria-hidden="true">
            {steps.map((item, index) => (
              <span
                key={`${item.route}-${index}`}
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
    </>
  );
}
