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
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C78A52]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-brand text-3xl font-semibold tracking-normal text-[#F6F1E8]">{title}</h2>
      {description ? <p className="text-sm leading-6 text-[#8B847B]">{description}</p> : null}
    </div>
  );
}
