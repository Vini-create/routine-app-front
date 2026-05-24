"use client";

import type { RoutineBlock } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTranslations } from "./LanguageProvider";

const statusTone = {
  pending: "neutral",
  active: "blue",
  done: "green",
  skipped: "amber",
} as const;

export function RoutineCard({
  block,
  isCurrent = false,
  onDone,
  onSkip,
  onEdit,
  onDelete,
}: {
  block: RoutineBlock;
  isCurrent?: boolean;
  onDone?: (id: string) => void;
  onSkip?: (id: string) => void;
  onEdit?: (block: RoutineBlock) => void;
  onDelete?: (id: string) => void;
}) {
  const labels = useTranslations("routineCard");
  const displayedStatus =
    isCurrent && block.status !== "done" && block.status !== "skipped"
      ? "active"
      : block.status === "active"
        ? "pending"
        : block.status;

  return (
    <Card className="grid gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-zinc-500">{block.time} · {block.duration}</p>
          <h3 className="mt-1 text-lg font-bold">{block.title}</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{block.description}</p>
        </div>
        <Badge tone={statusTone[displayedStatus]}>
          {displayedStatus === "active" ? labels.now : labels[displayedStatus]}
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant={block.status === "done" ? "secondary" : "primary"}
          className="px-2 text-xs"
          onClick={() => onDone?.(block.id)}
        >
          {block.status === "done" ? labels.undo : labels.complete}
        </Button>
        <Button variant="secondary" className="px-2 text-xs" onClick={() => onEdit?.(block)}>
          {labels.edit}
        </Button>
        <Button variant="secondary" className="px-2 text-xs" onClick={() => onSkip?.(block.id)}>
          {labels.skip}
        </Button>
        <Button variant="ghost" className="px-2 text-xs text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200" onClick={() => onDelete?.(block.id)}>
          {labels.remove}
        </Button>
      </div>
    </Card>
  );
}
