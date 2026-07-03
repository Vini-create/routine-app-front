"use client";

import { forwardRef, useState } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const durationOptions = [
  "10 min",
  "15 min",
  "20 min",
  "30 min",
  "45 min",
  "1 h",
  "1 h 30 min",
  "2 h",
  "3 h",
  "4 h",
  "6 h",
  "8 h",
] as const;

const timeOptions = Array.from({ length: 24 * 4 }, (_, index) => {
  const hours = Math.floor(index / 4);
  const minutes = (index % 4) * 15;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

export function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[var(--text-secondary)]">
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
        "min-h-12 rounded-[1.15rem] border border-[var(--border-soft)] bg-[var(--surface-ambient)] px-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:ring-4 focus:ring-black/5 dark:focus:ring-white/8",
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
        "min-h-28 rounded-[1.15rem] border border-[var(--border-soft)] bg-[var(--surface-ambient)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:ring-4 focus:ring-black/5 dark:focus:ring-white/8",
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
        "min-h-12 rounded-[1.15rem] border border-[var(--border-soft)] bg-[var(--surface-ambient)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-strong)] focus:ring-4 focus:ring-black/5 dark:focus:ring-white/8",
        props.className,
      )}
    />
  );
}

export function DurationSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Select {...props}>
      {durationOptions.map((duration) => (
        <option key={duration} value={duration}>{duration}</option>
      ))}
    </Select>
  );
}

export function TimeSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const selectedValue = typeof props.value === "string"
    ? props.value
    : typeof props.defaultValue === "string"
      ? props.defaultValue
      : "";
  const hasCustomValue = /^\d{2}:\d{2}$/.test(selectedValue) && !timeOptions.includes(selectedValue);

  return (
    <span className="relative block">
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
      <Select {...props} className={cn("w-full pl-11 tabular-nums", props.className)}>
        <option value="">--:--</option>
        {hasCustomValue ? <option value={selectedValue}>{selectedValue}</option> : null}
        {timeOptions.map((time) => (
          <option key={time} value={time}>{time}</option>
        ))}
      </Select>
    </span>
  );
}
