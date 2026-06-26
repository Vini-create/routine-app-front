import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "./LanguageProvider";

export function AiSuggestionCard({
  title,
  text,
}: {
  title?: string;
  text: string;
}) {
  const common = useTranslations("common");

  return (
    <Card className="glass-focus">
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-[var(--text-primary)]">{title ?? common.smartAdjustment}</p>
          <span className="rounded-full border border-[var(--border-medium)] bg-[var(--surface-standard)] px-3 py-1 text-xs font-bold text-[var(--text-primary)]">
            {common.ai}
          </span>
        </div>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">{text}</p>
        <Button href="/routine" variant="secondary" className="w-full">
          {common.applySuggestion}
        </Button>
      </div>
    </Card>
  );
}
