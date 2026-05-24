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
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-zinc-100 text-lg dark:bg-zinc-900">
        +
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm leading-6 text-zinc-500">{description}</p>
    </Card>
  );
}
