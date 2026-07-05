"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { HabitCard } from "@/components/app/HabitCard";
import { useTranslations } from "@/components/app/LanguageProvider";
import { SectionTitle } from "@/components/app/SectionTitle";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DurationInput, FieldLabel, Input, Select, Textarea, TimeInput } from "@/components/ui/Form";
import { ApiError } from "@/lib/api";
import type { Habit, ItemStatus } from "@/lib/api-contracts";
import { toDateKey, weekRange } from "@/lib/date";
import { preferredHabitTimes, readHabitPreferences, writeHabitPreferences } from "@/lib/habitPreferences";
import { routineApi } from "@/lib/routineApi";
import { buildRRule, parseRRule, type RecurrenceFrequency } from "@/lib/rrule";

export default function HabitsPage() {
  const labels = useTranslations("habitsPage");
  const common = useTranslations("common");
  const queryClient = useQueryClient();
  const range = weekRange();
  const [editing, setEditing] = useState<Habit | null>(null);
  const [editRecurrence, setEditRecurrence] = useState<RecurrenceFrequency>("weekly");
  const [error, setError] = useState("");
  const [preferences, setPreferences] = useState(readHabitPreferences);
  const dashboard = useQuery({ queryKey: ["habits-dashboard", range.start, range.end], queryFn: () => routineApi.habitsDashboard(range.start, range.end) });
  const habits = useQuery({ queryKey: ["habits"], queryFn: routineApi.listHabits });
  const goals = useQuery({ queryKey: ["goals"], queryFn: routineApi.listGoals });
  const mutation = useMutation({
    mutationFn: async (action: () => Promise<unknown>) => action(),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: ["habits"] }),
      queryClient.invalidateQueries({ queryKey: ["habits-dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["goals-dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["agenda"] }),
    ]),
    onError: (cause) => setError(cause instanceof ApiError ? cause.detail : "Não foi possível concluir a ação."),
  });

  async function openEdit(id: string) {
    setError("");
    try { const habit = await routineApi.getHabit(id); setEditing(habit); setEditRecurrence(parseRRule(habit.recurrence_rule).frequency); }
    catch (cause) { setError(cause instanceof ApiError ? cause.detail : "Não foi possível carregar o hábito."); }
  }

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editing) return;
    const data = new FormData(event.currentTarget);
    const selected = data.getAll(editRecurrence === "monthly" ? "monthDays" : "weekDays").map(Number);
    const preferredTime = String(data.get("preferredTime") || "08:00");
    mutation.mutate(() => routineApi.updateHabit(editing.id, {
      goal_id: String(data.get("goalId")), name: String(data.get("name")),
      description: String(data.get("description")) || null, duration_minutes: Number(data.get("duration")),
      recurrence_rule: buildRRule(editRecurrence, selected), start_date: editing.start_date,
    }), { onSuccess: () => {
      const next = { ...preferences, [editing.id]: { ...preferences[editing.id], preferredTime } };
      setPreferences(next);
      writeHabitPreferences(next);
      setEditing(null);
    } });
  }

  function logHabit(id: string, status: ItemStatus) {
    mutation.mutate(() => routineApi.logHabit(id, toDateKey(new Date()), status));
  }

  const items = dashboard.data?.habits ?? [];
  const preferredTimes = preferredHabitTimes(preferences);
  return (
    <AppShell title={labels.title} infoPage="habits">
      <div className="flex items-center justify-between gap-4"><SectionTitle title={labels.heading} description={labels.description} /><Button href="/goals">{labels.add}</Button></div>
      <Card className="habitGuideCard grid gap-3"><p className="habitGuideText text-sm font-semibold leading-6">{labels.consistencyGuide}</p><div className="flex flex-wrap gap-2 text-xs font-bold text-[var(--text-tertiary)]"><span className="habitGuidePill habitGuidePillFire">{labels.fireGuide}</span><span className="habitGuidePill habitGuidePillGrass">{labels.grassGuide}</span><span className="habitGuidePill habitGuidePillIce">{labels.iceGuide}</span><span className="habitGuidePill habitGuidePillEmpty">{labels.emptyGuide}</span></div><p className="text-xs text-[var(--text-tertiary)]">{habits.data?.length ?? items.length} hábitos ativos · semana de {range.start} a {range.end}</p></Card>
      {error ? <p role="alert" className="text-sm font-semibold text-red-500">{error}</p> : null}
      {dashboard.isLoading ? <Card>Carregando hábitos…</Card> : null}
      {items.map((item) => <HabitCard key={item.habit.id} item={item} preferredTime={preferredTimes[item.habit.id]} onLog={logHabit} onEdit={openEdit} onDelete={(id) => { if (window.confirm("Excluir este hábito permanentemente?")) mutation.mutate(() => routineApi.deleteHabit(id)); }} />)}
      {!dashboard.isLoading && !items.length ? <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} href="/goals" /> : null}
      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/55 p-4 backdrop-blur-md sm:place-items-center">
          <Card className="alfredModalSurface max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto">
            <form onSubmit={saveEdit} className="grid gap-3">
              <h2 className="text-xl font-bold">Editar hábito</h2>
              <FieldLabel label={labels.habitName}><Input name="name" defaultValue={editing.name} minLength={2} maxLength={60} required /></FieldLabel>
              <FieldLabel label="Meta"><Select name="goalId" defaultValue={editing.goal_id ?? ""}>{goals.data?.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}</Select></FieldLabel>
              <div className="grid gap-3 sm:grid-cols-2">
                <DurationInput name="duration" label={common.duration} defaultMinutes={editing.duration_minutes} />
                <FieldLabel label={labels.preferredTime}><TimeInput name="preferredTime" defaultValue={preferredTimes[editing.id] ?? "08:00"} /></FieldLabel>
              </div>
              <FieldLabel label="Recorrência"><Select value={editRecurrence} onChange={(event) => setEditRecurrence(event.target.value as RecurrenceFrequency)}><option value="daily">Diário</option><option value="weekly">Semanal</option><option value="monthly">Mensal</option><option value="yearly">Anual</option></Select></FieldLabel>
              {editRecurrence === "weekly" ? <DayPicker name="weekDays" count={7} defaults={parseRRule(editing.recurrence_rule).frequency === "weekly" ? parseRRule(editing.recurrence_rule).selected : [1,2,3,4,5]} /> : editRecurrence === "monthly" ? <DayPicker name="monthDays" count={31} defaults={parseRRule(editing.recurrence_rule).frequency === "monthly" ? parseRRule(editing.recurrence_rule).selected : [1]} /> : null}
              <FieldLabel label={labels.reason}><Textarea name="description" maxLength={200} defaultValue={editing.description ?? ""} /></FieldLabel>
              <div className="grid grid-cols-2 gap-2"><Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button><Button type="submit" disabled={mutation.isPending}>Salvar</Button></div>
            </form>
          </Card>
        </div>
      ) : null}
    </AppShell>
  );
}

function DayPicker({ name, count, defaults }: { name: string; count: number; defaults: number[] }) {
  return <div className="grid grid-cols-7 gap-1.5">{Array.from({ length: count }, (_, index) => count === 7 ? index : index + 1).map((day) => <label key={day} className="grid min-h-10 place-items-center rounded-2xl bg-[var(--surface-ambient)] text-xs font-bold"><input className="peer sr-only" type="checkbox" name={name} value={day} defaultChecked={defaults.includes(day)} /><span className="grid size-full place-items-center rounded-2xl peer-checked:bg-[var(--text-primary)] peer-checked:text-[var(--background-primary)]">{count === 7 ? ["D","S","T","Q","Q","S","S"][day] : day}</span></label>)}</div>;
}
