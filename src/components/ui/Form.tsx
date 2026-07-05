"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useTranslations } from "@/components/app/LanguageProvider";
import { cn } from "@/lib/utils";

export function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-semibold text-[var(--text-secondary)]">
      {label}
      {children}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(props, ref) {
  return (
    <input
      ref={ref}
      {...props}
      className={cn(
        "min-h-12 w-full min-w-0 rounded-[1.15rem] border border-[var(--border-soft)] bg-[var(--surface-ambient)] px-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:ring-4 focus:ring-black/5 dark:focus:ring-white/8",
        props.className,
      )}
    />
  );
});

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  showLabel?: string;
  hideLabel?: string;
}>(function PasswordInput({ showLabel = "Mostrar senha", hideLabel = "Ocultar senha", className, ...props }, ref) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative block">
      <Input
        ref={ref}
        {...props}
        type={visible ? "text" : "password"}
        className={cn("w-full pr-12", className)}
      />
      <button
        type="button"
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-[var(--text-tertiary)] transition hover:bg-[var(--surface-standard)] hover:text-[var(--text-primary)]"
      >
        {visible ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" d="m4 4 16 16"/><path strokeLinecap="round" strokeLinejoin="round" d="M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.4A10.5 10.5 0 0 1 12 4c5 0 8.5 4.5 9 6.5a8.8 8.8 0 0 1-2.1 3.7M6.2 6.2C4.4 7.5 3.3 9.2 3 10.5 3.5 12.5 7 17 12 17c1 0 2-.2 2.8-.5"/></svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5C3.5 8.5 7 4 12 4s8.5 4.5 9 6.5C20.5 12.5 17 17 12 17s-8.5-4.5-9-6.5Z"/><circle cx="12" cy="10.5" r="2.5"/></svg>
        )}
      </button>
    </span>
  );
});

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full min-w-0 rounded-[1.15rem] border border-[var(--border-soft)] bg-[var(--surface-ambient)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:ring-4 focus:ring-black/5 dark:focus:ring-white/8",
        props.className,
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "min-h-12 w-full min-w-0 rounded-[1.15rem] border border-[var(--border-soft)] bg-[var(--surface-ambient)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-strong)] focus:ring-4 focus:ring-black/5 dark:focus:ring-white/8",
        props.className,
      )}
    />
  );
}

export function DurationInput({
  name,
  label,
  defaultMinutes = 30,
  min = 1,
  max = 1440,
  className,
}: {
  name: string;
  label: string;
  defaultMinutes?: number;
  min?: number;
  max?: number;
  className?: string;
}) {
  const common = useTranslations("common");
  const initialHours = Math.floor(defaultMinutes / 60);
  const initialMinutes = defaultMinutes % 60;
  const [hours, setHours] = useState(String(initialHours));
  const [minutes, setMinutes] = useState(String(initialMinutes));
  const containerRef = useRef<HTMLFieldSetElement>(null);
  const hoursNumber = Number(hours) || 0;
  const totalMinutes = hoursNumber * 60 + (Number(minutes) || 0);
  const maximumHours = Math.floor(max / 60);
  const maximumMinutes = hoursNumber >= maximumHours ? max % 60 : 59;
  const minimumMinutes = hoursNumber === 0 ? Math.min(min, 59) : 0;

  useEffect(() => {
    const form = containerRef.current?.closest("form");
    if (!form) return;

    const reset = () => {
      setHours(String(initialHours));
      setMinutes(String(initialMinutes));
    };
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [initialHours, initialMinutes]);

  return (
    <fieldset ref={containerRef} className={cn("grid min-w-0 gap-2", className)}>
      <legend className="mb-2 text-sm font-semibold text-[var(--text-secondary)]">{label}</legend>
      <div className="grid min-w-0 grid-cols-2 gap-2">
        <span className="relative min-w-0">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={maximumHours}
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            onBlur={() => { if (hours === "") setHours("0"); }}
            aria-label={common.durationHours}
            className="pr-9 tabular-nums"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-tertiary)]">h</span>
        </span>
        <span className="relative min-w-0">
          <Input
            type="number"
            inputMode="numeric"
            min={minimumMinutes}
            max={maximumMinutes}
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
            onBlur={() => { if (minutes === "") setMinutes("0"); }}
            aria-label={common.durationMinutes}
            className="pr-11 tabular-nums"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-tertiary)]">min</span>
        </span>
      </div>
      <input
        type="number"
        name={name}
        value={totalMinutes}
        min={min}
        max={max}
        readOnly
        required
        tabIndex={-1}
        aria-label={label}
        className="pointer-events-none absolute size-px opacity-0"
      />
    </fieldset>
  );
}

export function TimeInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <span className="relative block min-w-0">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-[var(--text-tertiary)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="8.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5V12l3 1.75" />
      </svg>
      <Input {...props} type="time" step={60} className={cn("w-full pl-11 tabular-nums", props.className)} />
    </span>
  );
}
