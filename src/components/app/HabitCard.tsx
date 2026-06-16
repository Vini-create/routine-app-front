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
    done: "bg-[#B87333] shadow-[0_8px_18px_-10px_rgba(184,115,51,0.9)]",
    partial: "bg-[#D8B08C] shadow-[0_8px_18px_-10px_rgba(216,176,140,0.8)]",
    low: "bg-[#5A2B20] shadow-[0_8px_18px_-10px_rgba(90,43,32,0.9)]",
    future: "bg-[#2B2B31]",
    off: "bg-[#2B2B31] text-[#8B847B]",
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
          habitVariant === "fire" && "bg-gradient-to-r from-[#9E612B] via-[#B87333] to-[#D8B08C]",
          habitVariant === "ice" && "bg-gradient-to-r from-[#2B2B31] via-[#8B847B] to-[#EDE6DA]",
          habitVariant === "grass" && "bg-gradient-to-r from-[#6F6A52] via-[#B87333] to-[#D8B08C]",
          habitVariant === "empty" && "bg-gradient-to-r from-[#2B2B31] via-[#8B847B] to-[#EDE6DA]",
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
        <span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-full bg-[#B87333]" /> {labels.greenLegend}</span>
        <span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-full bg-[#D8B08C]" /> {labels.yellowLegend}</span>
        <span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-full bg-[#5A2B20]" /> {labels.redLegend}</span>
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
