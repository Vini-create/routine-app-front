import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function DevelopmentNotice({
  label,
  description,
  footnote,
  className,
}: {
  label: string;
  description: string;
  footnote: string;
  className?: string;
}) {
  return (
    <Card className={cn("developmentNotice grid gap-3 hover:translate-y-0", className)}>
      <span className="developmentBadge w-fit rounded-full border px-3 py-1 text-xs font-extrabold">
        {label}
      </span>
      <div className="grid gap-2 text-sm leading-6 text-[var(--text-secondary)]">
        <p>{description}</p>
        <p>{footnote}</p>
      </div>
    </Card>
  );
}
