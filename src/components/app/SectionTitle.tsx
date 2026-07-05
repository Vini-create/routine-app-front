export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      {eyebrow ? (
        <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="break-words font-display text-[2rem] font-light uppercase leading-[0.95] text-[var(--text-primary)] [overflow-wrap:anywhere] sm:text-4xl">{title}</h2>
      {description ? <p className="subtitle-display max-w-3xl break-words text-lg text-[var(--text-secondary)]">{description}</p> : null}
    </div>
  );
}
