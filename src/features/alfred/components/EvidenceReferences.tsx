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
        {references.map((reference) => (
          <article key={`${reference.document_id}-${reference.chunk_id}`} className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-standard)] p-3">
            <p className="text-sm font-bold text-[var(--text-primary)]">{reference.title}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[.06em] text-[var(--text-tertiary)]">{reference.source}</p>
            {reference.supporting_excerpt ? <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{reference.supporting_excerpt}</p> : null}
          </article>
        ))}
      </div>
    </details>
  );
}
