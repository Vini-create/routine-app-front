"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AIUsageResponse, QuotaUsage } from "../api/alfred.types";

export type UsageLabels = {
  button: string;
  title: string;
  standard: string;
  rag: string;
  deepAnalysis: string;
  rateLimit: string;
  remaining: string;
  used: string;
  resetsAt: string;
  perMinute: string;
  close: string;
  unlimited: string;
};

type UsageRow = { key: string; label: string; quota: QuotaUsage };

export function buildUsageRows(usage: AIUsageResponse, labels: UsageLabels): UsageRow[] {
  return [
    { key: "standard", label: labels.standard, quota: usage.standard_requests_today },
    { key: "rag", label: labels.rag, quota: usage.rag_requests_today },
    { key: "deep", label: labels.deepAnalysis, quota: usage.deep_analyses_this_week },
  ];
}

function quotaValue(quota: QuotaUsage, unlimitedLabel: string) {
  return quota.limit === null
    ? unlimitedLabel
    : `${quota.remaining ?? Math.max(0, quota.limit - quota.used)}/${quota.limit}`;
}

export function UsageIndicator({ usage, loading, labels, locale }: {
  usage: AIUsageResponse | null;
  loading: boolean;
  labels: UsageLabels;
  locale: string;
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  if (loading) {
    return <span className="h-8 w-24 animate-pulse rounded-full bg-[var(--surface-ambient)]" aria-label={labels.button} />;
  }
  if (!usage) return null;

  const standardValue = quotaValue(usage.standard_requests_today, labels.unlimited);
  const modal = open && typeof document !== "undefined"
    ? createPortal(
      <div className="fixed inset-0 z-[130] grid items-end bg-black/60 p-3 backdrop-blur-md sm:place-items-center sm:p-6" role="presentation" onPointerDown={() => setOpen(false)}>
        <section role="dialog" aria-modal="true" aria-labelledby="alfred-usage-title" onPointerDown={(event) => event.stopPropagation()} className="alfredModalSurface flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] border border-[var(--border-medium)] bg-[var(--surface-solid)] shadow-[0_30px_90px_-30px_rgba(0,0,0,.9)]">
          <header className="flex items-center justify-between gap-4 border-b border-[var(--border-soft)] px-5 py-4">
            <div>
              <p className="label-micro">{usage.plan}</p>
              <h2 id="alfred-usage-title" className="mt-1 font-display text-2xl font-light uppercase leading-none text-[var(--text-primary)]">{labels.title}</h2>
            </div>
            <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label={labels.close} className="grid size-10 place-items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-ambient)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
          </header>

          <div className="grid min-h-0 gap-3 overflow-y-auto p-4 sm:p-5">
            {buildUsageRows(usage, labels).map((row) => {
              const value = quotaValue(row.quota, labels.unlimited);
              const percentage = row.quota.limit ? Math.min(100, Math.max(0, (row.quota.used / row.quota.limit) * 100)) : 0;
              return (
                <article key={row.key} className="rounded-[1.15rem] border border-[var(--border-soft)] bg-[var(--surface-ambient)] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-[var(--text-primary)]">{row.label}</h3>
                      <p className="mt-1 text-[10px] text-[var(--text-tertiary)]">{labels.used}: {row.quota.used} · {labels.remaining}: {value}</p>
                    </div>
                    <span className="rounded-full border border-[var(--border-medium)] px-3 py-1 text-xs font-extrabold text-[var(--text-primary)]">{value}</span>
                  </div>
                  {row.quota.limit !== null ? (
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-standard)]" aria-hidden="true">
                      <div className="h-full rounded-full bg-emerald-400 transition-[width]" style={{ width: `${percentage}%` }} />
                    </div>
                  ) : null}
                  <p className="mt-2 text-[10px] text-[var(--text-tertiary)]">{labels.resetsAt}: {new Date(row.quota.reset_at).toLocaleString(locale)}</p>
                </article>
              );
            })}
            <article className="flex items-center justify-between gap-4 rounded-[1.15rem] border border-[var(--border-soft)] bg-[var(--surface-ambient)] p-4">
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">{labels.rateLimit}</h3>
              <span className="rounded-full border border-[var(--border-medium)] px-3 py-1 text-xs font-extrabold text-[var(--text-primary)]">{usage.requests_per_minute} {labels.perMinute}</span>
            </article>
          </div>
        </section>
      </div>,
      document.body,
    ) : null;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-ambient)] px-3 text-[10px] font-extrabold uppercase tracking-[.06em] text-[var(--text-tertiary)] transition hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]" title={`${labels.standard}: ${standardValue}`} aria-haspopup="dialog" aria-expanded={open}>
        <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
        <span className="hidden sm:inline">{labels.button}</span>
        <span>{standardValue}</span>
      </button>
      {modal}
    </>
  );
}
