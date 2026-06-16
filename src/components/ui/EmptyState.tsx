import { Card } from "./Card";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="grid gap-3 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-xl border border-[#B87333]/40 bg-[#B87333]/10 text-lg text-[#D8B08C]">
        +
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm leading-6 text-[#8B847B]">{description}</p>
    </Card>
  );
}
