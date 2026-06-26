import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

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
