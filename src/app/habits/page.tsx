"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { HabitCard } from "@/components/app/HabitCard";
import { useTranslations } from "@/components/app/LanguageProvider";
import { useRoutineHabitRecords } from "@/components/app/useRoutineHabitRecords";
import { SectionTitle } from "@/components/app/SectionTitle";
import { useAppData } from "@/components/app/useAppData";
import { useStoredHabits } from "@/components/app/useStoredHabits";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/Form";
import type { Habit } from "@/types";

export default function HabitsPage() {
  const { habits: initialHabits } = useAppData();
  const { storedHabits, addStoredHabit } = useStoredHabits();
  const { records } = useRoutineHabitRecords();
  const [open, setOpen] = useState(false);
  const labels = useTranslations("habitsPage");

  const habits: Habit[] = [...initialHabits, ...storedHabits];

  function createHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const scheduledDays = formData.getAll("scheduledDays").map(Number);
    const name = String(formData.get("name") || labels.habitName);
    const preferredTime = String(formData.get("preferredTime") || "08:00");

    addStoredHabit({
      id: crypto.randomUUID(),
      source: "user",
      createdAt: new Date().toISOString(),
      name,
      category: String(formData.get("category") || labels.category),
      frequency: scheduledDays.length === 7 ? labels.daily : `${scheduledDays.length}x`,
      preferredTime,
      scheduledDays: scheduledDays.length ? scheduledDays : [1, 2, 3, 4, 5],
      difficulty: (formData.get("difficulty") as Habit["difficulty"]) || "media",
      reason: String(formData.get("reason") || ""),
      streak: 0,
      weeklyProgress: 0,
      completedToday: false,
    });
    setOpen(false);
  }

  return (
    <AppShell title={labels.title}>
      <div className="flex items-center justify-between gap-4">
        <SectionTitle title={labels.heading} description={labels.description} />
        <Button onClick={() => setOpen(true)} className="shrink-0">{labels.add}</Button>
      </div>
      <Card className="grid gap-3">
        <p className="text-sm font-semibold leading-6 text-[#B9B0A4]">
          {labels.consistencyGuide}
        </p>
        <div className="flex flex-wrap gap-2 text-xs font-bold text-[#8B847B]">
          <span className="rounded-full border border-[#B87333]/70 bg-[#B87333]/12 px-3 py-1 text-[#D8B08C]">{labels.fireGuide}</span>
          <span className="rounded-full border border-[#C78A52]/60 bg-[#C78A52]/10 px-3 py-1 text-[#D8B08C]">{labels.grassGuide}</span>
          <span className="rounded-full border border-[#8B847B]/60 bg-[#8B847B]/10 px-3 py-1 text-[#EDE6DA]">{labels.iceGuide}</span>
          <span className="rounded-full border border-[#2B2B31] bg-[#17171A] px-3 py-1 text-[#8B847B]">{labels.emptyGuide}</span>
        </div>
      </Card>
      {habits.length ? (
        habits.map((habit) => <HabitCard key={habit.id} habit={habit} routineRecords={records} />)
      ) : (
        <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} />
      )}
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-4">
          <Card className="max-h-[86dvh] w-full max-w-xl overflow-y-auto overscroll-contain">
            <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-4 flex items-center justify-between bg-white/95 px-5 py-4 backdrop-blur dark:bg-zinc-950/95">
              <h2 className="text-xl font-bold">{labels.newHabit}</h2>
              <Button variant="ghost" onClick={() => setOpen(false)}>{labels.close}</Button>
            </div>
            <form onSubmit={createHabit} className="grid gap-3 pb-2">
              <FieldLabel label={labels.habitName}><Input name="name" placeholder={labels.habitPlaceholder} required /></FieldLabel>
              <FieldLabel label={labels.category}><Input name="category" placeholder={labels.categoryPlaceholder} /></FieldLabel>
              <FieldLabel label={labels.preferredTime}><Input name="preferredTime" type="time" defaultValue="08:00" /></FieldLabel>
              <FieldLabel label={labels.scheduleDays}>
                <div className="grid grid-cols-7 gap-1.5">
                  {labels.weekdays.map((day, index) => (
                    <label key={day} className="grid min-h-12 place-items-center rounded-2xl bg-zinc-50 text-xs font-bold dark:bg-zinc-900">
                      <input className="peer sr-only" type="checkbox" name="scheduledDays" value={index} defaultChecked={index > 0 && index < 6} />
                      <span className="grid size-full place-items-center rounded-2xl transition peer-checked:bg-zinc-950 peer-checked:text-white dark:peer-checked:bg-white dark:peer-checked:text-zinc-950">
                        {day}
                      </span>
                    </label>
                  ))}
                </div>
              </FieldLabel>
              <p className="-mt-1 text-xs leading-5 text-zinc-500">{labels.scheduleHint}</p>
              <FieldLabel label={labels.difficulty}>
                <Select name="difficulty" defaultValue="media">
                  <option value="baixa">{labels.low}</option>
                  <option value="media">{labels.medium}</option>
                  <option value="alta">{labels.high}</option>
                </Select>
              </FieldLabel>
              <FieldLabel label={labels.reason}><Textarea name="reason" placeholder={labels.reasonPlaceholder} /></FieldLabel>
              <Button type="submit">{labels.create}</Button>
            </form>
          </Card>
        </div>
      ) : null}
    </AppShell>
  );
}
