"use client";

import { FormEvent, useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { useRoutineHabitRecords } from "@/components/app/useRoutineHabitRecords";
import { useStoredGoals } from "@/components/app/useStoredGoals";
import { useStoredHabits } from "@/components/app/useStoredHabits";
import { useTranslations } from "@/components/app/LanguageProvider";
import { SectionTitle } from "@/components/app/SectionTitle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/Form";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import { getCurrentMonthRange, getHabitPeriodStats } from "@/lib/routineHabitRecords";
import type { Goal, Habit } from "@/types";

type GoalPeriod = "month" | "since";
type HabitRecurrenceType = "weekly" | "monthly";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getGoalTimeProgress(goal: Goal, today = new Date()) {
  const start = new Date(goal.createdAt);
  const target = new Date(`${goal.targetDate}T00:00:00`);
  const normalizedStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const normalizedTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const total = Math.max(1, Math.floor((normalizedTarget.getTime() - normalizedStart.getTime()) / 86_400_000) + 1);
  const elapsed = Math.min(total, Math.max(1, Math.floor((normalizedToday.getTime() - normalizedStart.getTime()) / 86_400_000) + 1));

  return {
    elapsed,
    total,
    percentage: Math.round((elapsed / total) * 100),
  };
}

function getGoalHabitVariant(progress: number, hasEnoughRoutineData: boolean): "fire" | "ice" | "grass" | "empty" {
  if (!hasEnoughRoutineData) return "empty";
  if (progress >= 70) return "fire";
  if (progress >= 40) return "grass";
  return "ice";
}

export default function GoalsPage() {
  const labels = useTranslations("goalsPage");
  const habitsLabels = useTranslations("habitsPage");
  const { storedGoals, addStoredGoal } = useStoredGoals();
  const { storedHabits, addStoredHabit } = useStoredHabits();
  const { records } = useRoutineHabitRecords();
  const [period, setPeriod] = useState<GoalPeriod>("month");
  const [habitGoalId, setHabitGoalId] = useState<string | null>(null);
  const [habitRecurrenceType, setHabitRecurrenceType] = useState<HabitRecurrenceType>("weekly");

  const habitsByGoal = useMemo(() => {
    return storedHabits.reduce<Record<string, Habit[]>>((groups, habit) => {
      if (!habit.goalId) return groups;
      groups[habit.goalId] = [...(groups[habit.goalId] ?? []), habit];
      return groups;
    }, {});
  }, [storedHabits]);

  function createGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    addStoredGoal({
      id: crypto.randomUUID(),
      source: "user",
      title: String(formData.get("title") || labels.fallbackGoalTitle),
      description: String(formData.get("description") || ""),
      category: (formData.get("category") as Goal["category"]) || "other",
      targetDate: String(formData.get("targetDate") || dateInputValue(addDays(new Date(), 90))),
      createdAt: new Date().toISOString(),
    });

    event.currentTarget.reset();
  }

  function createHabit(event: FormEvent<HTMLFormElement>, goal: Goal) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const scheduledDays = formData.getAll("scheduledDays").map(Number);
    const monthlyDays = formData.getAll("monthlyDays").map(Number);
    const name = String(formData.get("name") || habitsLabels.habitName);
    const preferredTime = String(formData.get("preferredTime") || "08:00");
    const recurrenceType = (formData.get("recurrenceType") as HabitRecurrenceType) || "weekly";
    const frequency = recurrenceType === "monthly"
      ? `${monthlyDays.length || 1}x/${labels.monthShort}`
      : scheduledDays.length === 7 ? habitsLabels.daily : `${scheduledDays.length || 5}x`;

    addStoredHabit({
      id: crypto.randomUUID(),
      source: "user",
      goalId: goal.id,
      createdAt: new Date().toISOString(),
      name,
      category: goal.category,
      frequency,
      preferredTime,
      recurrenceType,
      scheduledDays: recurrenceType === "weekly" ? (scheduledDays.length ? scheduledDays : [1, 2, 3, 4, 5]) : [],
      monthlyDays: recurrenceType === "monthly" ? (monthlyDays.length ? monthlyDays : [1]) : [],
      difficulty: (formData.get("difficulty") as Habit["difficulty"]) || "media",
      reason: String(formData.get("reason") || ""),
      streak: 0,
      weeklyProgress: 0,
      completedToday: false,
    });

    setHabitGoalId(null);
    setHabitRecurrenceType("weekly");
  }

  return (
    <AppShell title={labels.title}>
      <SectionTitle title={labels.heading} description={labels.description} />

      <Card className="grid gap-4">
        <form onSubmit={createGoal} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <FieldLabel label={labels.goalName}>
              <Input name="title" placeholder={labels.goalPlaceholder} required />
            </FieldLabel>
            <FieldLabel label={labels.targetDate}>
              <Input name="targetDate" type="date" defaultValue={dateInputValue(addDays(new Date(), 90))} required />
            </FieldLabel>
          </div>
          <FieldLabel label={labels.category}>
            <Select name="category" defaultValue="productivity">
              <option value="health">{labels.health}</option>
              <option value="productivity">{labels.productivity}</option>
              <option value="learning">{labels.learning}</option>
              <option value="fitness">{labels.fitness}</option>
              <option value="mental_wellness">{labels.mentalWellness}</option>
              <option value="other">{labels.other}</option>
            </Select>
          </FieldLabel>
          <FieldLabel label={labels.descriptionLabel}>
            <Textarea name="description" placeholder={labels.descriptionPlaceholder} />
          </FieldLabel>
          <Button type="submit">{labels.createGoal}</Button>
        </form>
      </Card>

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionTitle title={labels.activeGoals} description={labels.activeGoalsDescription} />
        <div className="goalPeriodControl alfredThemeControl grid w-full grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] rounded-2xl border p-1 text-xs sm:w-auto sm:min-w-72">
          <button
            type="button"
            aria-pressed={period === "month"}
            onClick={() => setPeriod("month")}
            className={cn("goalPeriodOption", period === "month" && "is-active")}
          >
            {labels.month}
          </button>
          <button
            type="button"
            aria-pressed={period === "since"}
            onClick={() => setPeriod("since")}
            className={cn("goalPeriodOption", period === "since" && "is-active")}
          >
            {labels.sinceCreation}
          </button>
        </div>
      </div>

      {storedGoals.length ? (
        storedGoals.map((goal) => {
          const goalHabits = habitsByGoal[goal.id] ?? [];
          const goalProgress = getGoalTimeProgress(goal);

          return (
            <Card key={goal.id} className="grid gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge tone="green">{labels.categoryLabels[goal.category]}</Badge>
                  <h2 className="mt-3 font-display text-4xl font-light uppercase leading-none text-[var(--text-primary)]">{goal.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{goal.description || labels.noDescription}</p>
                </div>
                <div className="shrink-0 rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-ambient)] px-3 py-2 text-right text-xs font-bold text-[var(--text-primary)]">
                  <span className="block text-[var(--text-tertiary)]">{labels.until}</span>
                  {goal.targetDate}
                </div>
              </div>

              <div className="glass-focus grid gap-4 rounded-3xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">{labels.goalTimeline}</p>
                    <h3 className="display-title mt-2 text-5xl text-[var(--text-primary)]">{goalProgress.elapsed}/{goalProgress.total}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{labels.daysTowardGoal}</p>
                  </div>
                  <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-ambient)] px-4 py-3 text-right">
                    <p className="font-display text-4xl font-light leading-none text-[var(--text-primary)]">{goalProgress.percentage}%</p>
                    <p className="text-xs font-bold text-[var(--text-tertiary)]">{labels.complete}</p>
                  </div>
                </div>
                <ProgressBar value={goalProgress.percentage} />
              </div>

              <div className="grid gap-3">
                {goalHabits.length ? (
                  goalHabits.map((habit) => (
                    <GoalHabitRow key={habit.id} habit={habit} period={period} records={records} />
                  ))
                ) : (
                  <p className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-ambient)] p-4 text-sm font-semibold text-[var(--text-secondary)]">
                    {labels.noHabits}
                  </p>
                )}
              </div>

              {habitGoalId === goal.id ? (
                <form onSubmit={(event) => createHabit(event, goal)} className="grid gap-3 rounded-3xl border border-[var(--border-medium)] bg-[var(--surface-ambient)] p-4">
                  <FieldLabel label={habitsLabels.habitName}>
                    <Input name="name" placeholder={habitsLabels.habitPlaceholder} required />
                  </FieldLabel>
                  <FieldLabel label={habitsLabels.preferredTime}>
                    <Input name="preferredTime" type="time" defaultValue="08:00" />
                  </FieldLabel>
                  <FieldLabel label={labels.recurrence}>
                    <Select
                      name="recurrenceType"
                      value={habitRecurrenceType}
                      onChange={(event) => setHabitRecurrenceType(event.target.value as HabitRecurrenceType)}
                    >
                      <option value="weekly">{labels.weekly}</option>
                      <option value="monthly">{labels.monthly}</option>
                    </Select>
                  </FieldLabel>
                  {habitRecurrenceType === "weekly" ? (
                    <FieldLabel label={habitsLabels.scheduleDays}>
                      <div className="grid grid-cols-7 gap-1.5">
                        {habitsLabels.weekdays.map((day, index) => (
                          <label key={day} className="grid min-h-11 place-items-center rounded-2xl bg-zinc-50 text-xs font-bold dark:bg-zinc-900">
                            <input className="peer sr-only" type="checkbox" name="scheduledDays" value={index} defaultChecked={index > 0 && index < 6} />
                            <span className="grid size-full place-items-center rounded-2xl transition peer-checked:bg-zinc-950 peer-checked:text-white dark:peer-checked:bg-white dark:peer-checked:text-zinc-950">
                              {day}
                            </span>
                          </label>
                        ))}
                      </div>
                    </FieldLabel>
                  ) : (
                    <FieldLabel label={labels.monthDays}>
                      <div className="grid grid-cols-7 gap-1.5">
                        {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                          <label key={day} className="grid min-h-10 place-items-center rounded-2xl bg-zinc-50 text-xs font-bold dark:bg-zinc-900">
                            <input className="peer sr-only" type="checkbox" name="monthlyDays" value={day} defaultChecked={day === 1} />
                            <span className="grid size-full place-items-center rounded-2xl transition peer-checked:bg-zinc-950 peer-checked:text-white dark:peer-checked:bg-white dark:peer-checked:text-zinc-950">
                              {day}
                            </span>
                          </label>
                        ))}
                      </div>
                    </FieldLabel>
                  )}
                  <FieldLabel label={habitsLabels.difficulty}>
                    <Select name="difficulty" defaultValue="media">
                      <option value="baixa">{habitsLabels.low}</option>
                      <option value="media">{habitsLabels.medium}</option>
                      <option value="alta">{habitsLabels.high}</option>
                    </Select>
                  </FieldLabel>
                  <FieldLabel label={habitsLabels.reason}>
                    <Textarea name="reason" placeholder={habitsLabels.reasonPlaceholder} />
                  </FieldLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="secondary" onClick={() => setHabitGoalId(null)}>{habitsLabels.close}</Button>
                    <Button type="submit">{labels.createHabit}</Button>
                  </div>
                </form>
              ) : (
                <Button onClick={() => {
                  setHabitGoalId(goal.id);
                  setHabitRecurrenceType("weekly");
                }}>{labels.addHabit}</Button>
              )}
            </Card>
          );
        })
      ) : (
        <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} />
      )}
    </AppShell>
  );
}

function GoalHabitRow({
  habit,
  period,
  records,
}: {
  habit: Habit;
  period: GoalPeriod;
  records: Parameters<typeof getHabitPeriodStats>[1];
}) {
  const labels = useTranslations("goalsPage");
  const monthRange = getCurrentMonthRange();
  const createdAt = habit.createdAt ? new Date(habit.createdAt) : monthRange.start;
  const stats = getHabitPeriodStats(habit, records, period === "month" ? monthRange.start : createdAt, monthRange.end);
  const variant = getGoalHabitVariant(stats.consistencyPercent, stats.hasEnoughRoutineData);

  return (
    <div
      className={cn(
        "habitCard relative overflow-hidden rounded-2xl border p-4",
        variant === "fire" && "habitCardFire",
        variant === "ice" && "habitCardIce",
        variant === "grass" && "habitCardGrass",
        variant === "empty" && "habitCardEmpty",
      )}
    >
      <div className="relative z-[1] flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black">{habit.name}</h3>
          <p className="mt-1 text-xs font-semibold text-zinc-500">{habit.frequency} · {habit.preferredTime}</p>
        </div>
        <p className="text-2xl font-black">{stats.hasEnoughRoutineData ? `${stats.consistencyPercent}%` : "—"}</p>
      </div>
      <div className="relative z-[1] mt-3">
        <ProgressBar value={stats.consistencyPercent} />
      </div>
      <div className="relative z-[1] mt-3 grid grid-cols-3 gap-2 text-xs font-bold text-zinc-500">
        <span>{stats.completedCount} {labels.done}</span>
        <span>{stats.partialCount} {labels.partial}</span>
        <span>{stats.lowCount} {labels.low}</span>
      </div>
    </div>
  );
}
