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
  routineRecords = [],
  onToggle,
}: {
  habit: Habit;
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

  const statusClass = {
    done: "bg-emerald-700 shadow-[0_8px_18px_-10px_rgba(4,120,87,0.9)] dark:bg-emerald-500",
    partial: "bg-amber-500 shadow-[0_8px_18px_-10px_rgba(217,119,6,0.95)] dark:bg-amber-400",
    low: "bg-red-700 shadow-[0_8px_18px_-10px_rgba(185,28,28,0.95)] dark:bg-red-500",
    future: "bg-zinc-100 dark:bg-zinc-900",
    off: "bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600",
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
        className={cn(
          "pointer-events-none absolute inset-x-4 top-0 z-[1] h-1 rounded-b-full",
          habitVariant === "fire" && "bg-gradient-to-r from-red-700 via-orange-500 to-yellow-300",
          habitVariant === "ice" && "bg-gradient-to-r from-blue-800 via-sky-400 to-cyan-200",
          habitVariant === "grass" && "bg-gradient-to-r from-emerald-800 via-green-500 to-lime-300",
          habitVariant === "empty" && "bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-300",
        )}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">{habit.name}</h3>
          <p className="text-sm text-zinc-500">{habit.frequency} · {habit.preferredTime}</p>
        </div>
        <Badge tone={stats.completedToday ? "green" : "purple"}>{stats.streak} {common.days}</Badge>
      </div>

      <div>
        <div className="mb-2 flex items-end justify-between">
          <p className="text-3xl font-black tracking-tight">
            {stats.hasEnoughRoutineData ? `${percentage}%` : "—"}
          </p>
          <p className="text-xs font-semibold text-zinc-500">{labels.weekProgress}</p>
        </div>
        <ProgressBar value={percentage} />
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div key={day.label} className="grid gap-1 text-center">
            <span className="text-[11px] font-bold text-zinc-500">{day.label}</span>
            <span className={cn("h-9 rounded-2xl ring-1 ring-black/5 dark:ring-white/10", statusClass[day.status])} />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-xs font-semibold text-zinc-500">
        <span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-full bg-emerald-700 dark:bg-emerald-500" /> {labels.greenLegend}</span>
        <span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-full bg-amber-500 dark:bg-amber-400" /> {labels.yellowLegend}</span>
        <span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-full bg-red-700 dark:bg-red-500" /> {labels.redLegend}</span>
      </div>

      <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">{habit.reason}</p>
      <p className="rounded-2xl bg-white/65 p-3 text-xs font-semibold leading-5 text-zinc-600 dark:bg-zinc-900/70 dark:text-zinc-300">
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
          variant={stats.completedToday ? "secondary" : "primary"}
          onClick={() => onToggle(habit.id)}
        >
          {stats.completedToday ? common.doneToday : common.markAsDone}
        </Button>
      ) : (
        <Button href="/routine" variant="secondary">
          {labels.trackInRoutine}
        </Button>
      )}
    </Card>
  );
}
