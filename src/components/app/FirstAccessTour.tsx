"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  expandedFirstAccessTourSteps,
  firstAccessTourCopy,
  mobileFirstAccessTourSteps,
} from "@/data/firstAccessTour";
import {
  clearFirstAccessTourOffer,
  completeFirstAccessTour,
  firstAccessTourStartEvent,
  hasCompletedFirstAccessTour,
  hasPendingFirstAccessTourOffer,
  readFirstAccessTourProgress,
  saveFirstAccessTourProgress,
} from "@/lib/firstAccessTour";
import { calculateTooltipLayout, normalizeSpotlightRect, overlayStyle, type SpotlightRect } from "@/lib/tourPosition";
import { useAuth } from "./AuthProvider";
import { useLanguage } from "./LanguageProvider";

const TARGET_WAIT_MS = 4_000;

function findVisibleElement(selector: string) {
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).find((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
  }) ?? null;
}

export function FirstAccessTour() {
  const { status, user } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const tooltipRef = useRef<HTMLElement>(null);
  const primaryActionRef = useRef<HTMLButtonElement>(null);
  const [invitationOpen, setInvitationOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [targetRect, setTargetRect] = useState<SpotlightRect | null>(null);
  const [targetReady, setTargetReady] = useState(false);
  const [viewport, setViewport] = useState({ width: 360, height: 800 });
  const [tooltipSize, setTooltipSize] = useState({ width: 320, height: 230 });
  const [isMobileTour, setIsMobileTour] = useState(false);
  const copy = firstAccessTourCopy[language];
  const allSteps = useMemo(() => expandedFirstAccessTourSteps(copy), [copy]);
  const steps = useMemo(
    () => isMobileTour ? mobileFirstAccessTourSteps(allSteps) : allSteps,
    [allSteps, isMobileTour],
  );
  const totalSteps = steps.length;
  const step = currentIndex === null ? null : steps[currentIndex];

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const updateMode = () => setIsMobileTour(media.matches);
    updateMode();
    media.addEventListener("change", updateMode);
    return () => media.removeEventListener("change", updateMode);
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || !user) return;
    const frame = window.requestAnimationFrame(() => {
      if (hasCompletedFirstAccessTour(user.id)) {
        clearFirstAccessTourOffer();
        setInvitationOpen(false);
        setCurrentIndex(null);
        return;
      }
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
    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let settleTimer = 0;
    let waitTimer = 0;
    let cancelled = false;

    const findPrimaryTarget = () => findVisibleElement(activeStep.selector);
    const findFallbackTarget = () => activeStep.fallbackSelector ? findVisibleElement(activeStep.fallbackSelector) : null;

    function updateTarget() {
      if (!target || cancelled) return;
      const rect = normalizeSpotlightRect(target.getBoundingClientRect(), window.innerWidth, window.innerHeight);
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      setTargetRect(rect);
      setTargetReady(true);
    }

    function attachTarget(element: HTMLElement) {
      target = element;
      target.classList.add("firstAccessTourTarget");
      const rect = target.getBoundingClientRect();
      const comfortablyVisible = rect.top >= 76 && rect.bottom <= window.innerHeight - 76;
      if (!comfortablyVisible) target.scrollIntoView({ behavior: "smooth", block: rect.height > window.innerHeight * 0.55 ? "start" : "center", inline: "nearest" });
      updateTarget();
      settleTimer = window.setTimeout(updateTarget, comfortablyVisible ? 40 : 420);
      if ("ResizeObserver" in window) {
        resizeObserver = new ResizeObserver(updateTarget);
        resizeObserver.observe(target);
      }
    }

    const startTime = performance.now();
    function locateTarget() {
      if (cancelled || target) return;
      const elapsed = performance.now() - startTime;
      const found = findPrimaryTarget() ?? (elapsed >= TARGET_WAIT_MS ? findFallbackTarget() : null);
      if (found) {
        mutationObserver?.disconnect();
        window.clearInterval(waitTimer);
        attachTarget(found);
        return;
      }
      if (elapsed >= TARGET_WAIT_MS) {
        const fallback = findVisibleElement("[data-tour='app-header']") ?? document.querySelector<HTMLElement>("main");
        if (fallback) attachTarget(fallback);
      }
    }

    const frame = window.requestAnimationFrame(() => {
      locateTarget();
      if (!target) {
        mutationObserver = new MutationObserver(locateTarget);
        mutationObserver.observe(document.body, { childList: true, subtree: true, attributes: true });
        waitTimer = window.setInterval(locateTarget, 120);
      }
    });

    window.addEventListener("resize", updateTarget);
    window.addEventListener("orientationchange", updateTarget);
    window.addEventListener("scroll", updateTarget, true);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      window.clearInterval(waitTimer);
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("orientationchange", updateTarget);
      window.removeEventListener("scroll", updateTarget, true);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      target?.classList.remove("firstAccessTourTarget");
    };
  }, [pathname, step]);

  useEffect(() => {
    const tooltip = tooltipRef.current;
    if (!tooltip || !("ResizeObserver" in window)) return;
    const observer = new ResizeObserver(([entry]) => {
      setTooltipSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(tooltip);
    return () => observer.disconnect();
  }, [invitationOpen, step]);

  useEffect(() => {
    if (!step && !invitationOpen) return;
    const frame = window.requestAnimationFrame(() => primaryActionRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [invitationOpen, step]);

  function finishTour(destination?: string) {
    if (user) completeFirstAccessTour(user.id);
    setInvitationOpen(false);
    setCurrentIndex(null);
    setTargetReady(false);
    if (destination) router.replace(destination);
  }

  function goToStep(index: number) {
    if (index < 0 || index >= totalSteps) return;
    saveFirstAccessTourProgress(index);
    setCurrentIndex(index);
    if (steps[index].route !== pathname) router.replace(steps[index].route);
  }

  useEffect(() => {
    if (!step || currentIndex === null) return;
    const activeIndex = currentIndex;
    function handleKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        finishTour();
        return;
      }
      if (event.key === "ArrowLeft" && activeIndex > 0) {
        event.preventDefault();
        goToStep(activeIndex - 1);
        return;
      }
      if (event.key === "ArrowRight" && activeIndex < totalSteps - 1) {
        event.preventDefault();
        goToStep(activeIndex + 1);
        return;
      }
      if (event.key !== "Tab" || !tooltipRef.current) return;
      const focusable = Array.from(tooltipRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex='-1'])"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  });

  if (!user || (!invitationOpen && (!step || currentIndex === null))) return null;

  function startTour() {
    clearFirstAccessTourOffer();
    setInvitationOpen(false);
    saveFirstAccessTourProgress(0);
    setCurrentIndex(0);
    router.replace(steps[0].route);
  }

  if (invitationOpen) {
    return (
      <div className="fixed inset-0 z-[100] grid items-end bg-black/58 p-3 backdrop-blur-[3px] sm:place-items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="first-access-invitation-title" aria-describedby="first-access-invitation-description">
        <section className="alfredModalSurface max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-[1.8rem] border border-[var(--border-medium)] bg-[var(--surface-solid)] p-5 shadow-focus sm:max-h-[calc(100dvh-3rem)] sm:p-6">
          <p className="label-micro">{copy.invitationEyebrow}</p>
          <h2 id="first-access-invitation-title" className="mt-2 break-words font-display text-[2rem] font-light uppercase leading-[0.95] text-[var(--text-primary)] sm:text-4xl">{copy.invitationTitle}</h2>
          <p id="first-access-invitation-description" className="mt-3 text-sm leading-6 text-[var(--text-secondary)] sm:text-base sm:leading-7">{copy.invitationDescription}</p>
          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            <button type="button" onClick={() => finishTour()} className="metallicButtonSecondary min-h-11 rounded-[1.2rem] border px-4 text-sm font-bold">{copy.invitationDecline}</button>
            <button ref={primaryActionRef} type="button" onClick={startTour} className="metallicButton min-h-11 rounded-[1.2rem] px-4 text-sm font-bold">{copy.invitationAccept}</button>
          </div>
        </section>
      </div>
    );
  }

  if (!step || currentIndex === null) return null;

  const isLastStep = currentIndex === totalSteps - 1;
  const layout = targetRect
    ? calculateTooltipLayout(targetRect, tooltipSize, viewport, step.preferredPlacement)
    : null;
  const percentage = ((currentIndex + 1) / totalSteps) * 100;
  const tooltipClass = `firstAccessTourTooltip firstAccessTourTooltip-${layout?.placement ?? "bottom"}`;

  return (
    <div className="pointer-events-none fixed inset-0 z-[97]" aria-live="polite" aria-atomic="true">
      {targetRect ? (
        <>
          <div className="firstAccessTourOverlay fixed z-[98]" style={overlayStyle(0, 0, viewport.width, targetRect.top)} />
          <div className="firstAccessTourOverlay fixed z-[98]" style={overlayStyle(targetRect.bottom, 0, viewport.width, viewport.height - targetRect.bottom)} />
          <div className="firstAccessTourOverlay fixed z-[98]" style={overlayStyle(targetRect.top, 0, targetRect.left, targetRect.height)} />
          <div className="firstAccessTourOverlay fixed z-[98]" style={overlayStyle(targetRect.top, targetRect.right, viewport.width - targetRect.right, targetRect.height)} />
          <div
            aria-hidden="true"
            className={`firstAccessTourSpotlight fixed z-[99] rounded-[1.35rem] border-2 border-white/85 ${step.allowInteraction ? "pointer-events-none" : "pointer-events-auto"}`}
            style={{ top: targetRect.top, left: targetRect.left, width: targetRect.width, height: targetRect.height }}
            onPointerDown={step.allowInteraction ? undefined : (event) => event.preventDefault()}
          />
        </>
      ) : (
        <div className="firstAccessTourOverlay fixed inset-0 z-[98]" />
      )}

      {layout ? (
        <section
          ref={tooltipRef}
          role="dialog"
          aria-modal={!step.allowInteraction}
          aria-labelledby="first-access-tour-title"
          aria-describedby="first-access-tour-description"
          style={layout.style}
          className={`${tooltipClass} alfredModalSurface fixed isolate z-[100] overflow-visible rounded-[1.25rem] border border-[var(--border-medium)] bg-[var(--surface-solid)] shadow-focus transition-[top,left,opacity,transform] duration-200 ${targetReady ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <span aria-hidden="true" className="firstAccessTourArrow absolute size-3 bg-[var(--surface-solid)]" style={layout.arrowStyle} />
          <div className="relative z-[1] overflow-visible rounded-[1.2rem] bg-[var(--surface-solid)] p-4 sm:overflow-y-auto" style={{ maxHeight: isMobileTour ? undefined : layout.style.maxHeight }}>
          <div className="flex items-center justify-between gap-3">
            <p className="label-micro">{copy.eyebrow}</p>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{copy.progress(currentIndex + 1, totalSteps)}</span>
          </div>
          <div className="mt-2 h-1 w-16 overflow-hidden rounded-full bg-[var(--surface-ambient)]" aria-hidden="true">
            <div className="h-full rounded-full bg-[var(--text-primary)] transition-[width] duration-300" style={{ width: `${percentage}%` }} />
          </div>
          <h2 id="first-access-tour-title" className="mt-3 break-words text-lg font-black leading-tight text-[var(--text-primary)]">{step.title}</h2>
          <p id="first-access-tour-description" className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">{step.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" disabled={currentIndex === 0} onClick={() => goToStep(currentIndex - 1)} className="metallicButtonSecondary min-h-10 rounded-xl border px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40">{copy.previous}</button>
            <button ref={primaryActionRef} type="button" onClick={() => isLastStep ? finishTour("/dashboard") : goToStep(currentIndex + 1)} className="metallicButton min-h-10 rounded-xl px-3 text-xs font-bold">{isLastStep ? copy.finish : copy.next}</button>
          </div>
          <button type="button" onClick={() => finishTour()} className="mt-2 min-h-9 w-full rounded-lg text-xs font-bold text-[var(--text-tertiary)] transition hover:bg-[var(--surface-ambient)] hover:text-[var(--text-primary)]">{copy.skip}</button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
