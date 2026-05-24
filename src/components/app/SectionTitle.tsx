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
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {description ? <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">{description}</p> : null}
    </div>
  );
}
