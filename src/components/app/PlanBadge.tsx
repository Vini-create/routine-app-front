"use client";

import { useAuth } from "./AuthProvider";
import { useTranslations } from "./LanguageProvider";
import { cn } from "@/lib/utils";

export function PlanBadge({ className = "" }: { className?: string }) {
  const { user } = useAuth();
  const settings = useTranslations("settings");
  const plan = user?.signature_plan ?? "free";
  const label = plan === "max" ? settings.planMax : plan === "pro" ? settings.planPro : settings.planFree;

  return (
    <span
      className={cn(
        "inline-flex min-h-7 shrink-0 items-center rounded-full border px-2.5 text-[9px] font-black uppercase tracking-[.08em] shadow-[inset_0_1px_0_rgba(255,255,255,.1)]",
        plan === "free"
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-500"
          : "border-[var(--border-medium)] bg-[var(--surface-standard)] text-[var(--text-secondary)]",
        className,
      )}
      title={`${settings.currentPlan}: ${label}`}
      aria-label={`${settings.currentPlan}: ${label}`}
    >
      {label}
    </span>
  );
}
