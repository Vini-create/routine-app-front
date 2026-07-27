import type { AnalysisReport } from "../api/alfred.types";

export function AnalysisReportCard({
  analysis,
  labels,
}: {
  analysis: AnalysisReport;
  labels: {
    title: string;
    patterns: string;
    hypotheses: string;
    recommendations: string;
    metrics: string;
    dataQuality: string;
  };
}) {
  return (
    <section className="mt-3 overflow-hidden rounded-[1.15rem] border border-[var(--border-medium)] bg-[var(--surface-ambient)]" aria-label={labels.title}>
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border-soft)] px-4 py-3">
        <div>
          <p className="label-micro">{labels.title}</p>
          <p className="mt-2 text-sm font-semibold leading-5 text-[var(--text-primary)]">{analysis.diagnosis.summary}</p>
        </div>
        <span className="rounded-full border border-[var(--border-soft)] px-2 py-1 text-[10px] font-bold text-[var(--text-tertiary)]">
          {labels.dataQuality} {Math.round(analysis.diagnosis.data_quality * 100)}%
        </span>
      </div>

      {analysis.patterns.length ? (
        <div className="px-4 py-3">
          <p className="text-[10px] font-extrabold uppercase tracking-[.08em] text-[var(--text-tertiary)]">{labels.patterns}</p>
          <div className="mt-2 grid gap-2">
            {analysis.patterns.map((pattern) => (
              <div key={`${pattern.name}-${pattern.description}`} className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-standard)] p-3">
                <p className="text-sm font-bold">{pattern.name}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{pattern.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {analysis.recommendations.length ? (
        <div className="border-t border-[var(--border-soft)] px-4 py-3">
          <p className="text-[10px] font-extrabold uppercase tracking-[.08em] text-[var(--text-tertiary)]">{labels.recommendations}</p>
          <ol className="mt-2 grid gap-2">
            {[...analysis.recommendations].sort((a, b) => a.priority - b.priority).map((recommendation) => (
              <li key={`${recommendation.priority}-${recommendation.title}`} className="grid grid-cols-[1.6rem_1fr] gap-2 text-xs leading-5 text-[var(--text-secondary)]">
                <span className="grid size-6 place-items-center rounded-full bg-[var(--text-primary)] text-[10px] font-black text-[var(--background-primary)]">{recommendation.priority}</span>
                <span>
                  <strong className="block text-[var(--text-primary)]">{recommendation.title}</strong>
                  {recommendation.rationale ? <span className="block">{recommendation.rationale}</span> : null}
                  <span className="mt-1 block font-semibold text-[var(--text-primary)]">{recommendation.action}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {analysis.hypotheses.length ? (
        <details className="border-t border-[var(--border-soft)] px-4 py-3">
          <summary className="cursor-pointer text-[10px] font-extrabold uppercase tracking-[.08em] text-[var(--text-tertiary)]">{labels.hypotheses} · {analysis.hypotheses.length}</summary>
          <div className="mt-2 grid gap-2">
            {analysis.hypotheses.map((hypothesis) => (
              <p key={hypothesis.hypothesis} className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-standard)] p-3 text-xs leading-5 text-[var(--text-secondary)]">
                {hypothesis.hypothesis}
              </p>
            ))}
          </div>
        </details>
      ) : null}

      {analysis.success_metrics.length ? (
        <div className="border-t border-[var(--border-soft)] px-4 py-3">
          <p className="text-[10px] font-extrabold uppercase tracking-[.08em] text-[var(--text-tertiary)]">{labels.metrics}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {analysis.success_metrics.map((metric) => (
              <span key={`${metric.name}-${metric.target}`} className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-standard)] px-3 py-1.5 text-[11px] font-semibold text-[var(--text-secondary)]">
                {metric.name}: {String(metric.target)}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
