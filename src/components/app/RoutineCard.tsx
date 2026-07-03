"use client";

import type { AgendaEntry } from "@/lib/agenda";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTranslations } from "./LanguageProvider";

export function RoutineCard({ entry, isCurrent = false, onDone, onSkip, onEdit, onDelete }: {
  entry: AgendaEntry;
  isCurrent?: boolean;
  onDone?: (entry: AgendaEntry) => void;
  onSkip?: (entry: AgendaEntry) => void;
  onEdit?: (entry: AgendaEntry) => void;
  onDelete?: (entry: AgendaEntry) => void;
}) {
  const labels = useTranslations("routineCard");
  const common = useTranslations("common");
  const isCompleted = entry.status === "completed";
  const isVacation = entry.status === "vacation";
  const statusLabel = isVacation ? labels.vacation : isCompleted ? labels.done : entry.status === "uncompleted" ? labels.missed : labels.pending;

  return (
    <Card className={cn("grid gap-4", isCurrent && entry.status === "pending" && "glass-focus border-[var(--border-strong)]")}>
      <div className="flex items-start justify-between gap-4">
        <div>
          {entry.source === "habit" ? <div className="mb-3 flex gap-2"><Badge tone="neutral">{common.habit}</Badge><Badge tone="blue">{entry.goalTitle ?? common.unlinkedGoal}</Badge></div> : null}
          <p className="text-sm font-bold text-[var(--text-secondary)]">{entry.time} · {entry.durationMinutes} min</p>
          <h3 className="subtitle-display mt-1 text-xl text-[var(--text-primary)]">{entry.title}</h3>
          {entry.description ? <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{entry.description}</p> : null}
        </div>
        <Badge tone={isVacation ? "blue" : isCompleted ? "green" : entry.status === "uncompleted" ? "amber" : "neutral"}>{isCurrent && entry.status === "pending" ? labels.now : statusLabel}</Badge>
      </div>
      {!isVacation ? <div className="flex flex-wrap gap-2">
        {onDone ? <Button className="flex-1" variant={isCompleted ? "secondary" : "primary"} onClick={() => onDone(entry)}>{isCompleted ? labels.undo : labels.complete}</Button> : null}
        {onSkip ? <Button variant="secondary" onClick={() => onSkip(entry)}>{labels.skip}</Button> : null}
        {entry.source === "item" && onEdit ? <Button variant="secondary" onClick={() => onEdit(entry)}>{labels.edit}</Button> : null}
        {entry.source === "item" && onDelete ? <Button variant="danger" onClick={() => onDelete(entry)}>{labels.remove}</Button> : null}
      </div> : null}
    </Card>
  );
}
