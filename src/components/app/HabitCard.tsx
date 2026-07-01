"use client";

import type { Habit } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getHabitRoutineStats, type RoutineHabitRecord } from "@/lib/routineHabitRecords";
import { useTranslations } from "./LanguageProvider";

function getHabitVariant(progress: number, hasEnoughRoutineData: boolean): "fire" | "ice" | "grass" | "empty" {
  if (!hasEnoughRoutineData) return "empty";

  if (progress >= 70) return "fire";
  if (progress >= 40) return "grass";
  return "ice";
}

export function HabitCard({
  habit,
  goalTitle,
  routineRecords = [],
  onToggle,
}: {
  habit: Habit;
  goalTitle?: string;
  routineRecords?: RoutineHabitRecord[];
  onToggle?: (id: string) => void;
}) {
  const common = useTranslations("common");
  const labels = useTranslations("habitsPage");
  const stats = getHabitRoutineStats(habit, routineRecords);
  const days = stats.weekDays.map((day) => ({
    label: labels.weekdays[new Date(`${day.date}T00:00:00`).getDay()],
    status: day.status,
  }));
  const percentage = stats.weeklyProgress;
  const habitVariant = getHabitVariant(percentage, stats.hasEnoughRoutineData);
  const resolvedGoalTitle = goalTitle ?? habit.goalTitle;

  const statusClass = {
    done: "habitDayDone",
    partial: "habitDayPartial",
    low: "habitDayLow",
    future: "habitDayFuture",
    off: "habitDayOff",
  };

  return (
    <Card
      className={cn(
        "habitCard relative grid gap-4 overflow-hidden",
        habitVariant === "fire" && "habitCardFire",
        habitVariant === "ice" && "habitCardIce",
        habitVariant === "grass" && "habitCardGrass",
        habitVariant === "empty" && "habitCardEmpty",
      )}
    >
      <span
        className="habitCardAccent pointer-events-none absolute inset-x-4 top-0 z-[1] h-1 rounded-b-full"
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge tone="neutral" className="habitCardBadge">{common.habit}</Badge>
            <Badge tone="blue" className="habitCardGoalBadge">{resolvedGoalTitle ?? common.unlinkedGoal}</Badge>
          </div>
          <h3 className="subtitle-display text-xl text-[var(--text-primary)]">{habit.name}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{habit.frequency} · {habit.preferredTime}</p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-end justify-between">
          <p className="habitCardPercentage text-3xl font-black tracking-tight">
            {stats.hasEnoughRoutineData ? `${percentage}%` : "—"}
          </p>
          <p className="text-xs font-semibold text-[var(--text-secondary)]">{labels.weekProgress}</p>
        </div>
        <ProgressBar value={percentage} />
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div key={day.label} className="grid gap-1 text-center">
            <span className="text-[11px] font-bold text-[var(--text-tertiary)]">{day.label}</span>
            <span className={cn("habitDay h-9 rounded-2xl", statusClass[day.status])} />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-xs font-semibold text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-2"><i className="habitLegendDone size-2.5 rounded-full" /> {labels.greenLegend}</span>
        <span className="inline-flex items-center gap-2"><i className="habitLegendPartial size-2.5 rounded-full" /> {labels.yellowLegend}</span>
        <span className="inline-flex items-center gap-2"><i className="habitLegendLow size-2.5 rounded-full" /> {labels.redLegend}</span>
      </div>

      <p className="text-sm leading-6 text-[var(--text-secondary)]">{habit.reason}</p>
      <p className="habitCardMessage rounded-2xl p-3 text-xs font-semibold leading-5">
        {habitVariant === "fire"
          ? labels.hotMessage
          : habitVariant === "ice"
            ? labels.frozenMessage
            : habitVariant === "empty"
              ? labels.emptyMessage
              : labels.neutralMessage}
      </p>
      {onToggle ? (
        <Button
          className="habitCardAction"
          variant={stats.completedToday ? "secondary" : "primary"}
          onClick={() => onToggle(habit.id)}
        >
          {stats.completedToday ? common.doneToday : common.markAsDone}
        </Button>
      ) : (
        <Button href="/routine" variant="secondary" className="habitCardAction">
          {labels.trackInRoutine}
        </Button>
      )}
    </Card>
  );
}
