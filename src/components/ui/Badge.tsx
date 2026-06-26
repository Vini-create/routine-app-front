import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "blue" | "purple" | "amber";
  className?: string;
}) {
  const tones = {
    neutral: "border-[var(--border-soft)] bg-[var(--surface-ambient)] text-[var(--text-secondary)]",
    green: "border-[var(--border-strong)] bg-[var(--surface-standard)] text-[var(--text-primary)]",
    blue: "border-[var(--border-medium)] bg-[var(--surface-standard)] text-[var(--text-primary)]",
    purple: "border-[var(--border-strong)] bg-[var(--surface-standard)] text-[var(--text-primary)]",
    amber: "border-[var(--border-strong)] bg-[var(--surface-ambient)] text-[var(--text-primary)]",
  };

  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-bold", tones[tone], className)}>
      {children}
    </span>
  );
}
