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
    <Card className="border-[#B87333]/45 bg-[#B87333]/10">
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-[#D8B08C]">{title ?? common.smartAdjustment}</p>
          <span className="rounded-full border border-[#2B2B31] bg-[#0B0B0D] px-3 py-1 text-xs font-bold text-[#F6F1E8]">
            {common.ai}
          </span>
        </div>
        <p className="text-sm leading-6 text-[#EDE6DA]">{text}</p>
        <Button href="/routine" variant="secondary" className="w-full">
          {common.applySuggestion}
        </Button>
      </div>
    </Card>
  );
}
