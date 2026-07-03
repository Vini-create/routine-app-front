"use client";

import type { HabitDashboardItem, ItemStatus } from "@/lib/api-contracts";
import { toDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useTranslations } from "./LanguageProvider";

const statusClass: Record<ItemStatus, string> = {
  completed: "habitDayDone",
  uncompleted: "habitDayLow",
  pending: "habitDayFuture",
  vacation: "bg-blue-400/70",
};

export function HabitCard({
  item,
  onLog,
  onEdit,
  onDelete,
  preferredTime,
}: {
  item: HabitDashboardItem;
  onLog?: (habitId: string, status: ItemStatus) => void;
  onEdit?: (habitId: string) => void;
  onDelete?: (habitId: string) => void;
  preferredTime?: string;
}) {
  const labels = useTranslations("habitsPage");
  const common = useTranslations("common");
  const today = toDateKey(new Date());
  const todayOccurrence = item.occurrences.find((occurrence) => occurrence.date === today);
  const canLog = todayOccurrence && todayOccurrence.status !== "vacation";
  const variant = item.consistency_level === "neutral" ? "empty" : item.consistency_level;

  return (
    <Card className={cn(
      "habitCard relative grid gap-4 overflow-hidden",
      variant === "fire" && "habitCardFire", variant === "ice" && "habitCardIce",
      variant === "grass" && "habitCardGrass", variant === "empty" && "habitCardEmpty",
    )}>
      <span className="habitCardAccent pointer-events-none absolute inset-x-4 top-0 z-[1] h-1 rounded-b-full" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge tone="neutral" className="habitCardBadge">{common.habit}</Badge>
            <Badge tone="blue" className="habitCardGoalBadge">{item.goal?.title ?? common.unlinkedGoal}</Badge>
          </div>
          <h3 className="subtitle-display text-xl text-[var(--text-primary)]">{item.habit.name}</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.habit.duration_minutes} min · {preferredTime ?? "08:00"} · {item.habit.recurrence_rule}</p>
        </div>
        <p className="habitCardPercentage text-3xl font-black">{item.expected_count ? `${Math.round(item.consistency_percent)}%` : "—"}</p>
      </div>
      <ProgressBar value={item.consistency_percent} />
      <div className="grid grid-cols-7 gap-2">
        {item.occurrences.map((occurrence) => (
          <div key={occurrence.date} className="grid gap-1 text-center">
            <span className="text-[11px] font-bold text-[var(--text-tertiary)]">{new Date(`${occurrence.date}T00:00:00`).getDate()}</span>
            <span title={occurrence.status} className={cn("habitDay h-9 rounded-2xl", statusClass[occurrence.status])} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-[var(--text-secondary)]">
        <span>{item.completed_count} concluídos</span><span>{item.uncompleted_count} não concluídos</span><span>{item.pending_count} pendentes</span>
      </div>
      <div className="flex flex-wrap gap-3 text-xs font-semibold text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-2"><i className="habitLegendDone size-2.5 rounded-full" />{labels.completedLegend}</span>
        <span className="inline-flex items-center gap-2"><i className="habitLegendLow size-2.5 rounded-full" />{labels.uncompletedLegend}</span>
        <span className="inline-flex items-center gap-2"><i className="habitDayFuture size-2.5 rounded-full border" />{labels.pendingLegend}</span>
      </div>
      {item.habit.description ? <p className="text-sm leading-6 text-[var(--text-secondary)]">{item.habit.description}</p> : null}
      <p className="habitCardMessage rounded-2xl p-3 text-xs font-semibold leading-5">
        {variant === "fire" ? labels.hotMessage : variant === "ice" ? labels.frozenMessage : variant === "grass" ? labels.neutralMessage : labels.emptyMessage}
      </p>
      <div className="flex flex-wrap gap-2">
        {onLog && canLog ? (
          <Button className="habitCardAction flex-1" variant={todayOccurrence.status === "completed" ? "secondary" : "primary"} onClick={() => onLog(item.habit.id, todayOccurrence.status === "completed" ? "pending" : "completed")}>
            {todayOccurrence.status === "completed" ? common.doneToday : common.markAsDone}
          </Button>
        ) : null}
        {onEdit ? <Button variant="secondary" onClick={() => onEdit(item.habit.id)}>Editar</Button> : null}
        {onDelete ? <Button variant="danger" onClick={() => onDelete(item.habit.id)}>Excluir</Button> : null}
      </div>
      {!item.occurrences.length ? <p className="text-sm text-[var(--text-secondary)]">{labels.emptyMessage}</p> : null}
    </Card>
  );
}
