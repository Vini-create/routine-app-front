import type { AIUsageResponse } from "../api/alfred.types";

export function UsageIndicator({
  usage,
  loading,
  label,
  unlimitedLabel,
}: {
  usage: AIUsageResponse | null;
  loading: boolean;
  label: string;
  unlimitedLabel: string;
}) {
  if (loading) {
    return <span className="h-8 w-24 animate-pulse rounded-full bg-[var(--surface-ambient)]" aria-label={label} />;
  }
  if (!usage) return null;

  const quota = usage.standard_requests_today;
  const value = quota.limit === null
    ? unlimitedLabel
    : `${quota.remaining ?? Math.max(0, quota.limit - quota.used)}/${quota.limit}`;

  return (
    <span
      className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-ambient)] px-3 text-[10px] font-extrabold uppercase tracking-[.06em] text-[var(--text-tertiary)]"
      title={`${label}: ${value}`}
    >
      <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
      {value}
    </span>
  );
}
