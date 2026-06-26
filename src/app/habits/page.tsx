"use client";

import { AppShell } from "@/components/app/AppShell";
import { HabitCard } from "@/components/app/HabitCard";
import { useTranslations } from "@/components/app/LanguageProvider";
import { useRoutineHabitRecords } from "@/components/app/useRoutineHabitRecords";
import { SectionTitle } from "@/components/app/SectionTitle";
import { useAppData } from "@/components/app/useAppData";
import { useStoredGoals } from "@/components/app/useStoredGoals";
import { useStoredHabits } from "@/components/app/useStoredHabits";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Habit } from "@/types";

export default function HabitsPage() {
  const { habits: initialHabits } = useAppData();
  const { storedGoals } = useStoredGoals();
  const { storedHabits } = useStoredHabits();
  const { records } = useRoutineHabitRecords();
  const labels = useTranslations("habitsPage");

  const habits: Habit[] = [...initialHabits, ...storedHabits];
  const goalTitleById = new Map(storedGoals.map((goal) => [goal.id, goal.title]));

  return (
    <AppShell title={labels.title}>
      <div className="flex items-center justify-between gap-4">
        <SectionTitle title={labels.heading} description={labels.description} />
        <Button href="/goals" className="shrink-0">{labels.add}</Button>
      </div>
      <Card className="habitGuideCard grid gap-3">
        <p className="habitGuideText text-sm font-semibold leading-6">
          {labels.consistencyGuide}
        </p>
        <div className="flex flex-wrap gap-2 text-xs font-bold text-[var(--text-tertiary)]">
          <span className="habitGuidePill habitGuidePillFire">{labels.fireGuide}</span>
          <span className="habitGuidePill habitGuidePillGrass">{labels.grassGuide}</span>
          <span className="habitGuidePill habitGuidePillIce">{labels.iceGuide}</span>
          <span className="habitGuidePill habitGuidePillEmpty">{labels.emptyGuide}</span>
        </div>
      </Card>
      {habits.length ? (
        habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            goalTitle={habit.goalTitle ?? (habit.goalId ? goalTitleById.get(habit.goalId) : undefined)}
            routineRecords={records}
          />
        ))
      ) : (
        <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} href="/goals" />
      )}
    </AppShell>
  );
}
