import type { AnalysisReport, IdentifiedPattern, SuccessMetric } from "../api/alfred.types";
import { cn } from "../../../lib/utils";

type AnalysisLabels = {
  title: string;
  summary: string;
  patterns: string;
  patternsIntro: string;
  hypotheses: string;
  recommendations: string;
  metrics: string;
  dataQuality: string;
  technicalDetails: string;
  confidence: string;
  confidenceHigh: string;
  confidenceMedium: string;
  confidenceLow: string;
  analysisBasis: string;
  plannedLoadComparison: string;
  completionComparison: string;
  dailyLoadComparison: string;
  expectedOccurrences: string;
  calculationBasedOnHistory: string;
  attention: string;
  positive: string;
  observation: string;
  patternDetected: string;
  completionRate: string;
  plannedLoad: string;
  recentInactivity: string;
  completionDeclining: string;
  completionIncreasing: string;
  completionStable: string;
  plannedLoadIncreasing: string;
  plannedLoadDeclining: string;
  plannedLoadStable: string;
  inactivityHigh: string;
  inactivityMedium: string;
  inactivityLow: string;
  variation: string;
  notEnoughData: string;
  baseline: string;
  target: string;
  evaluationWindow: string;
  days: string;
};

function normalizedIdentifier(value: string) {
  return value.toLowerCase().replaceAll("-", "_");
}

function fallbackTitle(value: string) {
  const words = value
    .replace(/^(trend|anomaly|metric)[:._-]?/i, "")
    .split(/[:._-]+/)
    .filter(Boolean);
  const title = words.join(" ");
  return title ? title.charAt(0).toUpperCase() + title.slice(1) : value;
}

function parseEvidence(value: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    const entries = [...value.matchAll(/["']?([\w-]+)["']?\s*:\s*(?:"([^"]*)"|'([^']*)'|(-?\d+(?:\.\d+)?|true|false|null))/gi)];
    if (!entries.length) return null;
    return Object.fromEntries(entries.map((match) => {
      const rawValue = match[2] ?? match[3] ?? match[4];
      if (rawValue === "true") return [match[1], true];
      if (rawValue === "false") return [match[1], false];
      if (rawValue === "null") return [match[1], null];
      const numericValue = Number(rawValue);
      return [match[1], Number.isNaN(numericValue) ? rawValue : numericValue];
    }));
  }
}

function numericField(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatMinutes(value: number, locale: string) {
  const rounded = Math.max(0, Math.round(value));
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (!hours) return `${minutes} min`;
  if (!minutes) return `${new Intl.NumberFormat(locale).format(hours)} h`;
  return `${new Intl.NumberFormat(locale).format(hours)} h ${minutes} min`;
}

function formatRate(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

function evidenceReading(
  pattern: IdentifiedPattern,
  evidence: string,
  labels: AnalysisLabels,
  locale: string,
) {
  const record = parseEvidence(evidence);
  if (!record) {
    const looksTechnical = /[{}[\]_=]|["']\w+["']\s*:/.test(evidence);
    return looksTechnical ? labels.calculationBasedOnHistory : evidence;
  }

  const previousMinutes = numericField(record, "previous_minutes")
    ?? numericField(record, "previous_7d_minutes");
  const recentMinutes = numericField(record, "recent_minutes")
    ?? numericField(record, "recent_7d_minutes");
  if (previousMinutes !== null && recentMinutes !== null) {
    return labels.plannedLoadComparison
      .replace("{previous}", formatMinutes(previousMinutes, locale))
      .replace("{recent}", formatMinutes(recentMinutes, locale));
  }

  const previousRate = numericField(record, "previous_rate")
    ?? numericField(record, "previous_7d_rate");
  const recentRate = numericField(record, "recent_rate")
    ?? numericField(record, "recent_7d_rate");
  if (previousRate !== null && recentRate !== null) {
    return labels.completionComparison
      .replace("{previous}", formatRate(previousRate, locale))
      .replace("{recent}", formatRate(recentRate, locale));
  }

  const baselineMinutes = numericField(record, "baseline_daily_minutes");
  const lastDayMinutes = numericField(record, "last_day_minutes");
  if (baselineMinutes !== null && lastDayMinutes !== null) {
    return labels.dailyLoadComparison
      .replace("{usual}", formatMinutes(baselineMinutes, locale))
      .replace("{last}", formatMinutes(lastDayMinutes, locale));
  }

  const expected = numericField(record, "expected_7d");
  if (expected !== null) {
    return labels.expectedOccurrences.replace(
      "{value}",
      new Intl.NumberFormat(locale).format(expected),
    );
  }

  return normalizedIdentifier(pattern.name).includes("recent_inactivity")
    ? labels.expectedOccurrences.replace("{value}", "—")
    : labels.calculationBasedOnHistory;
}

function confidenceReading(value: number, labels: AnalysisLabels) {
  if (value >= 0.75) return labels.confidenceHigh;
  if (value >= 0.45) return labels.confidenceMedium;
  return labels.confidenceLow;
}

function patternTitle(pattern: IdentifiedPattern, labels: AnalysisLabels) {
  const name = normalizedIdentifier(pattern.name);
  if (name.includes("completion_rate")) return labels.completionRate;
  if (name.includes("planned_load")) return labels.plannedLoad;
  if (name.includes("recent_inactivity")) return labels.recentInactivity;
  return fallbackTitle(pattern.name);
}

function patternReading(
  pattern: IdentifiedPattern,
  labels: AnalysisLabels,
  locale: string,
) {
  const name = normalizedIdentifier(pattern.name);
  const description = pattern.description.toLowerCase();
  const direction = description.match(/direction\s*=\s*(declining|decreasing|increasing|stable)/)?.[1];
  const deltaMatch = description.match(/delta\s*=\s*(-?\d+(?:\.\d+)?)/)?.[1];
  const severity = description.match(/severity(?:\s+|=)(high|medium|low)/)?.[1];
  const delta = deltaMatch ? Number(deltaMatch) : null;
  const variation = delta !== null && Number.isFinite(delta)
    ? labels.variation.replace(
      "{value}",
      new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(Math.abs(delta) <= 1 ? Math.abs(delta) * 100 : Math.abs(delta)),
    )
    : "";

  if (name.includes("completion_rate")) {
    const main = direction === "declining" || direction === "decreasing"
      ? labels.completionDeclining
      : direction === "increasing"
        ? labels.completionIncreasing
        : labels.completionStable;
    return {
      text: variation ? `${main} ${variation}` : main,
      tone: direction === "declining" || direction === "decreasing" ? "attention" as const : direction === "increasing" ? "positive" as const : "neutral" as const,
    };
  }

  if (name.includes("planned_load")) {
    const main = direction === "increasing"
      ? labels.plannedLoadIncreasing
      : direction === "declining" || direction === "decreasing"
        ? labels.plannedLoadDeclining
        : labels.plannedLoadStable;
    return {
      text: delta === null ? `${main} ${labels.notEnoughData}` : variation ? `${main} ${variation}` : main,
      tone: direction === "increasing" ? "attention" as const : "neutral" as const,
    };
  }

  if (name.includes("recent_inactivity")) {
    return {
      text: severity === "high"
        ? labels.inactivityHigh
        : severity === "medium"
          ? labels.inactivityMedium
          : labels.inactivityLow,
      tone: severity === "high" ? "attention" as const : "neutral" as const,
    };
  }

  const looksTechnical = /[=_]/.test(pattern.description) || /^(trend|anomaly|metric)[:._-]/i.test(pattern.description);
  return {
    text: looksTechnical ? labels.patternDetected : pattern.description,
    tone: "neutral" as const,
  };
}

function metricTitle(metric: SuccessMetric, labels: AnalysisLabels) {
  const name = normalizedIdentifier(metric.name);
  if (name.includes("completion_rate")) return labels.completionRate;
  if (name.includes("planned_load")) return labels.plannedLoad;
  if (name.includes("recent_inactivity")) return labels.recentInactivity;
  return fallbackTitle(metric.name);
}

function formatMetricValue(value: number | string | null, labels: AnalysisLabels, locale: string) {
  if (value === null || value === "" || value === "not_available") return labels.notEnoughData;
  if (typeof value === "number") return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  return value.replaceAll("_", " ");
}

export function AnalysisReportCard({
  analysis,
  labels,
  locale,
}: {
  analysis: AnalysisReport;
  labels: AnalysisLabels;
  locale: string;
}) {
  const dataQuality = Math.max(0, Math.min(100, Math.round(analysis.diagnosis.data_quality * 100)));

  return (
    <section className="mt-3 overflow-hidden rounded-[1.3rem] border border-[var(--border-medium)] bg-[var(--surface-ambient)] shadow-[var(--shadow-soft)]" aria-label={labels.title}>
      <div className="border-b border-[var(--border-soft)] px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface-standard)] text-[var(--text-secondary)]">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 18V9m5 9V5m5 13v-6m5 6V3" />
            </svg>
          </span>
          <div>
            <p className="label-micro">{labels.title}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-[var(--text-tertiary)]">{labels.summary}</p>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold leading-6 text-[var(--text-primary)]">{analysis.diagnosis.summary}</p>

        <div className="mt-4 grid gap-1.5">
          <div className="flex items-center justify-between gap-3 text-[10px] font-bold text-[var(--text-tertiary)]">
            <span>{labels.dataQuality}</span>
            <span>{dataQuality}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-standard)]">
            <div className="h-full rounded-full bg-[var(--text-primary)] transition-[width]" style={{ width: `${dataQuality}%` }} />
          </div>
        </div>
      </div>

      {analysis.patterns.length ? (
        <div className="px-4 py-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[.08em] text-[var(--text-tertiary)]">{labels.patterns}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-tertiary)]">{labels.patternsIntro}</p>
          <div className="mt-3 grid gap-2.5">
            {analysis.patterns.map((pattern) => {
              const reading = patternReading(pattern, labels, locale);
              const toneLabel = reading.tone === "attention" ? labels.attention : reading.tone === "positive" ? labels.positive : labels.observation;
              return (
                <article key={`${pattern.name}-${pattern.description}`} className="rounded-[1rem] border border-[var(--border-soft)] bg-[var(--surface-standard)] p-3.5">
                  <div className="flex items-start gap-3">
                    <span className={cn(
                      "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border text-sm",
                      reading.tone === "attention"
                        ? "border-amber-400/25 bg-amber-400/10 text-amber-500"
                        : reading.tone === "positive"
                          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-500"
                          : "border-[var(--border-soft)] bg-[var(--surface-ambient)] text-[var(--text-secondary)]",
                    )}>
                      {reading.tone === "attention" ? "!" : reading.tone === "positive" ? "↑" : "•"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-extrabold text-[var(--text-primary)]">{patternTitle(pattern, labels)}</h3>
                        <span className="rounded-full border border-[var(--border-soft)] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[.06em] text-[var(--text-tertiary)]">{toneLabel}</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">{reading.text}</p>
                    </div>
                  </div>

                  <details className="mt-3 border-t border-[var(--border-soft)] pt-2.5">
                    <summary className="cursor-pointer text-[10px] font-bold text-[var(--text-tertiary)] marker:text-[var(--text-tertiary)]">{labels.technicalDetails}</summary>
                    <div className="mt-3 grid gap-3 text-xs leading-5 text-[var(--text-secondary)]">
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--surface-ambient)] px-3 py-2">
                        <span className="font-semibold">{labels.confidence}</span>
                        <span className="rounded-full border border-[var(--border-soft)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--text-primary)]">
                          {confidenceReading(pattern.confidence, labels)} · {Math.round(pattern.confidence * 100)}%
                        </span>
                      </div>
                      {pattern.evidence.length ? (
                        <div>
                          <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[.07em] text-[var(--text-tertiary)]">{labels.analysisBasis}</p>
                          <ul className="grid gap-1.5">
                            {pattern.evidence.map((evidence) => (
                              <li key={evidence} className="flex gap-2 rounded-xl bg-[var(--surface-ambient)] px-3 py-2">
                                <span aria-hidden="true" className="text-[var(--text-tertiary)]">•</span>
                                <span>{evidenceReading(pattern, evidence, labels, locale)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </details>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      {analysis.recommendations.length ? (
        <div className="border-t border-[var(--border-soft)] px-4 py-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[.08em] text-[var(--text-tertiary)]">{labels.recommendations}</p>
          <ol className="mt-3 grid gap-3">
            {[...analysis.recommendations].sort((a, b) => a.priority - b.priority).map((recommendation) => (
              <li key={`${recommendation.priority}-${recommendation.title}`} className="grid grid-cols-[1.8rem_1fr] gap-3 text-xs leading-5 text-[var(--text-secondary)]">
                <span className="grid size-7 place-items-center rounded-full bg-[var(--text-primary)] text-[10px] font-black text-[var(--background-primary)]">{recommendation.priority}</span>
                <span>
                  <strong className="block text-sm text-[var(--text-primary)]">{recommendation.title}</strong>
                  {recommendation.rationale ? <span className="mt-1 block">{recommendation.rationale}</span> : null}
                  <span className="mt-1.5 block rounded-xl border border-[var(--border-soft)] bg-[var(--surface-standard)] px-3 py-2 font-semibold text-[var(--text-primary)]">{recommendation.action}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {analysis.hypotheses.length ? (
        <details className="border-t border-[var(--border-soft)] px-4 py-4">
          <summary className="cursor-pointer text-[10px] font-extrabold uppercase tracking-[.08em] text-[var(--text-tertiary)]">{labels.hypotheses} · {analysis.hypotheses.length}</summary>
          <div className="mt-3 grid gap-2">
            {analysis.hypotheses.map((hypothesis) => (
              <p key={hypothesis.hypothesis} className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-standard)] p-3 text-xs leading-5 text-[var(--text-secondary)]">
                {hypothesis.hypothesis}
              </p>
            ))}
          </div>
        </details>
      ) : null}

      {analysis.success_metrics.length ? (
        <div className="border-t border-[var(--border-soft)] px-4 py-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[.08em] text-[var(--text-tertiary)]">{labels.metrics}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {analysis.success_metrics.map((metric) => (
              <article key={`${metric.name}-${metric.target}`} className="rounded-[1rem] border border-[var(--border-soft)] bg-[var(--surface-standard)] p-3.5">
                <p className="text-xs font-extrabold text-[var(--text-primary)]">{metricTitle(metric, labels)}</p>
                <dl className="mt-2 grid gap-1.5 text-[10px] text-[var(--text-tertiary)]">
                  <div className="flex items-center justify-between gap-3"><dt>{labels.baseline}</dt><dd className="font-bold text-[var(--text-secondary)]">{formatMetricValue(metric.baseline, labels, locale)}</dd></div>
                  <div className="flex items-center justify-between gap-3"><dt>{labels.target}</dt><dd className="font-bold text-[var(--text-primary)]">{formatMetricValue(metric.target, labels, locale)}</dd></div>
                  <div className="flex items-center justify-between gap-3"><dt>{labels.evaluationWindow}</dt><dd className="font-bold text-[var(--text-secondary)]">{metric.evaluation_window_days} {labels.days}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
