import Link from "next/link";
import { Card } from "./Card";

export function EmptyState({
  title,
  description,
  href,
  actionLabel,
}: {
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
}) {
  const plusClasses = "emptyStateAction mx-auto grid size-14 place-items-center rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-ambient)] text-xl font-black text-[var(--text-primary)] transition hover:-translate-y-0.5";

  return (
    <Card className="emptyStateCard grid gap-4 text-center">
      {href ? (
        <Link aria-label={actionLabel ?? title} className={plusClasses} href={href}>
          +
        </Link>
      ) : (
        <div className={plusClasses}>+</div>
      )}
      <h3 className="emptyStateTitle font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="emptyStateDescription text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
    </Card>
  );
}
