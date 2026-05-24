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
    <Card className="border-emerald-100 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/30">
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">{title ?? common.smartAdjustment}</p>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-zinc-950">
            {common.ai}
          </span>
        </div>
        <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-200">{text}</p>
        <Button href="/routine" variant="secondary" className="w-full">
          {common.applySuggestion}
        </Button>
      </div>
    </Card>
  );
}
