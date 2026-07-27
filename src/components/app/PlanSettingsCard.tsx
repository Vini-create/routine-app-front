"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "./AuthProvider";
import { useTranslations } from "./LanguageProvider";
import { PlanBadge } from "./PlanBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function PlanSettingsCard() {
  const { user } = useAuth();
  const settings = useTranslations("settings");
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const plan = user?.signature_plan ?? "free";
  const planLabel = plan === "max" ? settings.planMax : plan === "pro" ? settings.planPro : settings.planFree;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const modal = open && typeof document !== "undefined"
    ? createPortal(
      <div
        className="fixed inset-0 z-[140] grid place-items-center bg-black/60 p-3 backdrop-blur-md sm:p-6"
        role="presentation"
        onPointerDown={() => setOpen(false)}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-plan-title"
          onPointerDown={(event) => event.stopPropagation()}
          className="alfredModalSurface max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-[1.75rem] border border-[var(--border-medium)] p-5 sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="label-micro">{settings.subscription}</p>
              <h2 id="upgrade-plan-title" className="mt-2 text-2xl font-black text-[var(--text-primary)]">{settings.upgradeComingSoonTitle}</h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label={settings.cancel}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-ambient)] text-xl text-[var(--text-secondary)]"
            >
              ×
            </button>
          </div>

          <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{settings.upgradeComingSoonDescription}</p>
          <div className="mt-5 grid gap-2">
            {settings.upgradeFeatures.map((feature) => (
              <div key={feature} className="flex items-start gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-ambient)] p-3.5">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--text-primary)] text-[10px] font-black text-[var(--background-primary)]">✓</span>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">{feature}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--text-tertiary)]">{settings.upgradeNoCharge}</p>
          <Button type="button" className="mt-5 w-full" onClick={() => setOpen(false)}>{settings.upgradeAcknowledge}</Button>
        </section>
      </div>,
      document.body,
    )
    : null;

  return (
    <>
      <Card data-tour="settings-plan" className="grid gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-micro">{settings.subscription}</p>
            <h2 className="mt-2 text-lg font-bold">{settings.currentPlan}</h2>
          </div>
          <PlanBadge />
        </div>
        <div className={plan === "free"
          ? "rounded-2xl border border-emerald-400/25 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,.13),transparent_52%),rgba(52,211,153,.055)] p-4"
          : "rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-ambient)] p-4"
        }>
          <div className="flex items-end justify-between gap-4">
            <p className="font-display text-3xl font-light uppercase text-[var(--text-primary)]">{planLabel}</p>
            {plan === "free" ? <p className="text-xl font-black text-emerald-500">{settings.freePlanPrice}</p> : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{settings.freePlanDescription}</p>
        </div>
        <Button type="button" onClick={() => setOpen(true)}>{settings.upgradePlan}</Button>
      </Card>
      {modal}
    </>
  );
}
