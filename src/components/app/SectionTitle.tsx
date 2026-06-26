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
    <div className="grid gap-2">
      {eyebrow ? (
        <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-4xl font-light uppercase leading-[0.92] text-[var(--text-primary)]">{title}</h2>
      {description ? <p className="subtitle-display max-w-3xl text-lg text-[var(--text-secondary)]">{description}</p> : null}
    </div>
  );
}
