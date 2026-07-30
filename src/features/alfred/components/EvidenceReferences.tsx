import type { EvidenceReference } from "../api/alfred.types";

export function EvidenceReferences({
  references,
  title,
}: {
  references: EvidenceReference[];
  title: string;
}) {
  if (!references.length) return null;

  return (
    <details className="mt-3 rounded-[1.1rem] border border-[var(--border-soft)] bg-[var(--surface-ambient)] px-4 py-3">
      <summary className="cursor-pointer text-xs font-extrabold uppercase tracking-[.07em] text-[var(--text-secondary)]">
        {title} · {references.length}
      </summary>
      <div className="mt-3 grid gap-2">
        {references.map((reference) => {
          const author =
            reference.authors?.length
              ? `${reference.authors[0]}${reference.authors.length > 1 ? " et al." : ""}`
              : null;
          const attribution = [author, reference.publication_year].filter(Boolean).join(" · ");
          const key = reference.source_id ?? `${reference.document_id}-${reference.chunk_id}`;
          return (
            <article key={key} className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-standard)] p-3">
              {reference.url ? (
                <a
                  href={reference.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-start gap-2 text-sm font-bold text-[var(--text-primary)] underline decoration-transparent underline-offset-4 transition hover:decoration-current"
                >
                  <span>{reference.title}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <p className="text-sm font-bold text-[var(--text-primary)]">{reference.title}</p>
              )}
              {attribution ? (
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">{attribution}</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </details>
  );
}
