"use client";

import { useEffect, useRef, useState } from "react";
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
}: {
  value: SelectedSkill;
  onChange: (skill: SelectedSkill) => void;
  options: SkillOption[];
  capabilities: AICapabilitiesResponse | null;
  disabled?: boolean;
  addLabel: string;
  unavailableLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function closeOnOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      {open ? (
        <div className="assistantSkillMenu absolute bottom-[calc(100%+0.7rem)] left-0 z-50 w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-[1.35rem] border border-[var(--border-medium)] bg-[var(--surface-solid)] p-2 shadow-[0_22px_65px_-24px_rgba(0,0,0,.72)] backdrop-blur-2xl">
          <div className="grid gap-1" role="menu" aria-label={addLabel}>
            {options.map((option) => {
              const unavailable = isUnavailable(option.value, capabilities);
              const selected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  disabled={unavailable}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "grid min-h-[3.75rem] grid-cols-[2.4rem_1fr_auto] items-center gap-2 rounded-[1rem] px-2.5 py-2 text-left transition",
                    selected ? "bg-[var(--surface-focus)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--surface-ambient)] hover:text-[var(--text-primary)]",
                    unavailable && "cursor-not-allowed opacity-45",
                  )}
                >
                  <span className="grid size-9 place-items-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface-ambient)]">
                    <svg viewBox="0 0 24 24" className="size-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <SkillIcon skill={option.value} />
                    </svg>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{option.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-[var(--text-tertiary)]">{option.description}</span>
                  </span>
                  {unavailable ? <span className="text-[9px] font-extrabold uppercase tracking-[.06em]">{unavailableLabel}</span> : selected ? <span aria-hidden="true">✓</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        aria-label={addLabel}
        title={`${addLabel}: ${current.label}`}
        aria-expanded={open}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className={cn(
          "assistantSkillTrigger grid size-11 place-items-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--surface-ambient)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-45",
          value !== "auto" && "bg-[var(--surface-ambient)] text-[var(--text-primary)]",
        )}
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
