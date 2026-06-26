"use client";

import type { RoutineBlock } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTranslations } from "./LanguageProvider";

const statusTone = {
  pending: "neutral",
  active: "blue",
  done: "green",
  skipped: "amber",
  missed: "amber",
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
  const common = useTranslations("common");
  const displayedStatus =
    isCurrent && block.status !== "done" && block.status !== "skipped" && block.status !== "missed"
      ? "active"
      : block.status === "active"
        ? "pending"
        : block.status;

  return (
    <Card className={cn("grid gap-4", isCurrent && "glass-focus border-[var(--border-strong)]")}>
      <div className="flex items-start justify-between gap-4">
        <div>
          {block.habitId ? (
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge tone="neutral">{common.habit}</Badge>
              <Badge tone="blue">{block.goalTitle ?? common.unlinkedGoal}</Badge>
            </div>
          ) : null}
          <p className="text-sm font-bold text-[var(--text-secondary)]">{block.time} · {block.duration}</p>
          <h3 className="subtitle-display mt-1 text-xl text-[var(--text-primary)]">{block.title}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{block.description}</p>
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
        <Button variant="danger" className="px-2 text-xs" onClick={() => onDelete?.(block.id)}>
          {labels.remove}
        </Button>
      </div>
    </Card>
  );
}
