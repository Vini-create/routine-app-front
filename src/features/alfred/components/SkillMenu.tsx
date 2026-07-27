"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AICapabilitiesResponse, SelectedSkill } from "../api/alfred.types";
import { cn } from "@/lib/utils";

export type SkillOption = {
  value: SelectedSkill;
  label: string;
  description: string;
};

function SkillIcon({ skill }: { skill: SelectedSkill }) {
  if (skill === "auto") {
    return <path d="M12 2.8 14.3 8l5.2 2.3-5.2 2.3-2.3 5.2-2.3-5.2-5.2-2.3L9.7 8 12 2.8Zm6.1 12.1.9 2 .9-2 2-.9-2-.9-.9-2-.9 2-2 .9 2 .9Z" />;
  }
  if (skill === "conversar") {
    return <path d="M5 4.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.7 3.2.9-3.2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />;
  }
  if (skill === "analisar_progresso") {
    return <path d="M4 19V9m5 10V5m5 14v-7m5 7V3M2.5 20.5h19" />;
  }
  if (skill === "reorganizar_rotina") {
    return <path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Zm3 8h3v3H8v-3Z" />;
  }
  if (skill === "criar_plano") {
    return <path d="M5 3h10l4 4v14H5V3Zm10 0v5h5M8 12h8M8 16h6" />;
  }
  return <path d="m20 20-4.4-4.4m2.4-5.1a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Zm-7.5-3v6m-3-3h6" />;
}

function isUnavailable(skill: SelectedSkill, capabilities: AICapabilitiesResponse | null) {
  if (!capabilities) return false;
  if (skill === "analisar_progresso") return !capabilities.capabilities.deep_analysis;
  if (skill === "consultar_conhecimento") return !capabilities.capabilities.rag;
  return false;
}

export function SkillMenu({
  value,
  onChange,
  options,
  capabilities,
  disabled,
  addLabel,
  unavailableLabel,
  closeLabel,
  showCurrentLabel = false,
}: {
  value: SelectedSkill;
  onChange: (skill: SelectedSkill) => void;
  options: SkillOption[];
  capabilities: AICapabilitiesResponse | null;
  disabled?: boolean;
  addLabel: string;
  unavailableLabel: string;
  closeLabel: string;
  showCurrentLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const current = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

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
        className="fixed inset-0 z-[120] grid items-end bg-black/60 p-3 backdrop-blur-md sm:place-items-center sm:p-6"
        role="presentation"
        onPointerDown={() => setOpen(false)}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="alfred-skill-menu-title"
          onPointerDown={(event) => event.stopPropagation()}
          className="alfredModalSurface max-h-[min(43rem,calc(100dvh-1.5rem))] w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-[var(--border-medium)] bg-[var(--surface-solid)] shadow-[0_30px_90px_-30px_rgba(0,0,0,.9)]"
        >
          <header className="flex items-center justify-between gap-4 border-b border-[var(--border-soft)] px-5 py-4">
            <div className="min-w-0">
              <p className="label-micro">{current.label}</p>
              <h2 id="alfred-skill-menu-title" className="mt-1 font-display text-2xl font-light uppercase leading-none text-[var(--text-primary)]">
                {addLabel}
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label={closeLabel}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-ambient)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </header>

          <div className="max-h-[calc(100dvh-7.5rem)] overflow-y-auto p-3 sm:p-4">
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={addLabel}>
              {options.map((option) => {
                const unavailable = isUnavailable(option.value, capabilities);
                const selected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={unavailable}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "grid min-h-[5.25rem] grid-cols-[2.75rem_1fr_auto] items-start gap-3 rounded-[1.2rem] border px-3 py-3 text-left transition",
                      selected
                        ? "border-[var(--border-strong)] bg-[var(--surface-focus)] text-[var(--text-primary)] shadow-[var(--shadow-soft)]"
                        : "border-[var(--border-soft)] bg-[var(--surface-ambient)] text-[var(--text-secondary)] hover:border-[var(--border-medium)] hover:bg-[var(--surface-standard)] hover:text-[var(--text-primary)]",
                      unavailable && "cursor-not-allowed opacity-45",
                    )}
                  >
                    <span className="grid size-11 place-items-center rounded-[.95rem] border border-[var(--border-soft)] bg-[var(--surface-standard)]">
                      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <SkillIcon skill={option.value} />
                      </svg>
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="block text-sm font-extrabold">{option.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--text-tertiary)]">{option.description}</span>
                    </span>
                    {unavailable ? (
                      <span className="pt-1 text-[9px] font-extrabold uppercase tracking-[.06em]">{unavailableLabel}</span>
                    ) : selected ? (
                      <span className="grid size-6 place-items-center rounded-full bg-[var(--text-primary)] text-[11px] font-black text-[var(--background-primary)]" aria-hidden="true">✓</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>,
      document.body,
    )
    : null;

  return (
    <div className="assistantSkillMenuRoot shrink-0">
      <button
        type="button"
        disabled={disabled}
        aria-label={addLabel}
        title={`${addLabel}: ${current.label}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          "assistantSkillTrigger grid size-11 place-items-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--surface-ambient)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-45",
          value !== "auto" && "bg-[var(--surface-ambient)] text-[var(--text-primary)]",
        )}
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      {showCurrentLabel ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className="assistantCurrentSkill hidden min-w-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-extrabold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] disabled:opacity-45"
          aria-label={`${addLabel}: ${current.label}`}
        >
          <span className="max-w-32 truncate">{current.label}</span>
          <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="m8 10 4 4 4-4" />
          </svg>
        </button>
      ) : null}
      {modal}
    </div>
  );
}
