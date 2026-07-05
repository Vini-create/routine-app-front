"use client";

import type { HabitDashboardItem, ItemStatus } from "@/lib/api-contracts";
import { toDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { describeRRule } from "@/lib/rrule";
import { useLanguage, useTranslations } from "./LanguageProvider";

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
  compact = false,
}: {
  item: HabitDashboardItem;
  onLog?: (habitId: string, status: ItemStatus) => void;
  onEdit?: (habitId: string) => void;
  onDelete?: (habitId: string) => void;
  preferredTime?: string;
  compact?: boolean;
}) {
  const labels = useTranslations("habitsPage");
  const common = useTranslations("common");
  const { language } = useLanguage();
  const today = toDateKey(new Date());
  const todayOccurrence = item.occurrences.find((occurrence) => occurrence.date === today);
  const canLog = todayOccurrence && todayOccurrence.status !== "vacation";
  const variant = item.consistency_level === "neutral" ? "empty" : item.consistency_level;
  const variantClasses = cn(
    variant === "fire" && "habitCardFire", variant === "ice" && "habitCardIce",
    variant === "grass" && "habitCardGrass", variant === "empty" && "habitCardEmpty",
  );

  if (compact) {
    return (
      <Card data-tour="habit-card" className={cn("habitCard relative grid min-w-0 max-w-full gap-3 overflow-hidden p-4 sm:p-5", variantClasses)}>
        <span className="habitCardAccent pointer-events-none absolute inset-x-4 top-0 z-[1] h-1 rounded-b-full" />
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Badge tone="blue" className="habitCardGoalBadge max-w-full whitespace-normal break-words [overflow-wrap:anywhere]">{item.goal?.title ?? common.unlinkedGoal}</Badge>
            <h3 className="subtitle-display mt-3 break-words text-xl text-[var(--text-primary)] [overflow-wrap:anywhere]">{item.habit.name}</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.habit.duration_minutes} min · {preferredTime ?? "08:00"}</p>
          </div>
          <p className="habitCardPercentage shrink-0 text-2xl font-black">{item.expected_count ? `${Math.round(item.consistency_percent)}%` : "—"}</p>
        </div>
        <ProgressBar value={item.consistency_percent} />
        {item.occurrences.length ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 gap-1.5" aria-label={`${item.completed_count} ${labels.completedLegend}`}>
              {item.occurrences.slice(-7).map((occurrence) => (
                <span key={occurrence.date} title={occurrence.status} className={cn("habitDay h-2.5 min-w-0 flex-1 rounded-full", statusClass[occurrence.status])} />
              ))}
            </div>
            <span className="shrink-0 text-xs font-bold text-[var(--text-secondary)]">{item.completed_count}/{item.expected_count}</span>
          </div>
        ) : null}
      </Card>
    );
  }

  return (
    <Card data-tour="habit-card" className={cn(
      "habitCard relative min-w-0 max-w-full grid gap-4 overflow-hidden",
      variantClasses,
    )}>
      <span className="habitCardAccent pointer-events-none absolute inset-x-4 top-0 z-[1] h-1 rounded-b-full" />
      <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge tone="neutral" className="habitCardBadge">{common.habit}</Badge>
            <Badge tone="blue" className="habitCardGoalBadge max-w-full whitespace-normal break-words [overflow-wrap:anywhere]">{item.goal?.title ?? common.unlinkedGoal}</Badge>
          </div>
          <h3 className="subtitle-display break-words text-xl text-[var(--text-primary)] [overflow-wrap:anywhere]">{item.habit.name}</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.habit.duration_minutes} min · {preferredTime ?? "08:00"}</p>
          <p className="mt-1 break-words text-sm font-semibold text-[var(--text-secondary)] [overflow-wrap:anywhere]">{describeRRule(item.habit.recurrence_rule, language)}</p>
        </div>
        <p className="habitCardPercentage shrink-0 text-2xl font-black sm:text-3xl">{item.expected_count ? `${Math.round(item.consistency_percent)}%` : "—"}</p>
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
      <div className="grid min-w-0 grid-cols-3 gap-1.5 text-center text-[11px] font-bold text-[var(--text-secondary)] sm:gap-2 sm:text-xs">
        <span className="min-w-0 break-words">{item.completed_count} concluídos</span><span className="min-w-0 break-words">{item.uncompleted_count} não concluídos</span><span className="min-w-0 break-words">{item.pending_count} pendentes</span>
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
      <div data-tour="habit-controls" className="flex flex-wrap gap-2">
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
