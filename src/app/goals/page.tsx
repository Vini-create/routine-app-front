"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { HabitCard } from "@/components/app/HabitCard";
import { useLanguage, useTranslations } from "@/components/app/LanguageProvider";
import { SectionTitle } from "@/components/app/SectionTitle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DurationInput, FieldLabel, Input, Select, Textarea, TimeInput } from "@/components/ui/Form";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ApiError } from "@/lib/api";
import type { Goal, GoalCategory, Habit } from "@/lib/api-contracts";
import { fromDateKey, monthRange, toDateKey } from "@/lib/date";
import { buildRRule, type RecurrenceFrequency } from "@/lib/rrule";
import { preferredHabitTimes, readHabitPreferences, writeHabitPreferences } from "@/lib/habitPreferences";
import { goalDeadlineProgress } from "@/lib/goalDeadline";
import { routineApi } from "@/lib/routineApi";

export default function GoalsPage() {
  const labels = useTranslations("goalsPage");
  const habitsLabels = useTranslations("habitsPage");
  const common = useTranslations("common");
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<"month" | "since">("month");
  const [habitGoalId, setHabitGoalId] = useState<string | null>(null);
  const [detailsGoalId, setDetailsGoalId] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [recurrence, setRecurrence] = useState<RecurrenceFrequency>("weekly");
  const [error, setError] = useState("");
  const [preferences, setPreferences] = useState(readHabitPreferences);
  const range = { ...monthRange(), end: toDateKey(new Date()) };
  const dashboard = useQuery({
    queryKey: ["goals-dashboard", period, range.start, range.end],
    queryFn: () => routineApi.goalsDashboard(range.end, period === "month" ? range.start : undefined),
  });
  const details = useQuery({
    queryKey: ["goal-habits", detailsGoalId, range.start, range.end],
    queryFn: () => routineApi.goalHabits(detailsGoalId!, range.start, range.end),
    enabled: Boolean(detailsGoalId),
  });

  function refresh() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ["goals-dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["goals"] }),
      queryClient.invalidateQueries({ queryKey: ["habits-dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["goal-habits"] }),
    ]);
  }
  const mutation = useMutation({ mutationFn: async (action: () => Promise<unknown>) => action(), onSuccess: refresh, onError: (cause) => setError(cause instanceof ApiError ? cause.detail : "Não foi possível salvar.") });

  function createGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    mutation.mutate(() => routineApi.createGoal({
      title: String(data.get("title")), description: String(data.get("description")) || null,
      category: data.get("category") as GoalCategory, target_date: String(data.get("targetDate")),
    }), { onSuccess: () => form.reset() });
  }

  function saveGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editingGoal) return;
    const data = new FormData(event.currentTarget);
    mutation.mutate(() => routineApi.updateGoal(editingGoal.id, {
      title: String(data.get("title")), description: String(data.get("description")) || null,
      category: data.get("category") as GoalCategory, target_date: String(data.get("targetDate")),
    }), { onSuccess: () => setEditingGoal(null) });
  }

  async function openEdit(id: string) {
    setError("");
    try { setEditingGoal(await routineApi.getGoal(id)); }
    catch (cause) { setError(cause instanceof ApiError ? cause.detail : "Não foi possível carregar a meta."); }
  }

  function createHabit(event: FormEvent<HTMLFormElement>, goalId: string) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const selected = data.getAll(recurrence === "monthly" ? "monthDays" : "weekDays").map(Number);
    const preferredTime = String(data.get("preferredTime") || "08:00");
    mutation.mutate(() => routineApi.createHabit({
      goal_id: goalId, name: String(data.get("name")), description: String(data.get("description")) || null,
      duration_minutes: Number(data.get("duration")), start_date: String(data.get("startDate")),
      recurrence_rule: buildRRule(recurrence, selected),
    }), { onSuccess: (created) => {
      const habit = created as Habit;
      const next = { ...preferences, [habit.id]: { preferredTime } };
      setPreferences(next);
      writeHabitPreferences(next);
      setHabitGoalId(null);
      setRecurrence("weekly");
    } });
  }

  const goals = dashboard.data?.goals ?? [];
  const preferredTimes = preferredHabitTimes(preferences);
  return (
    <AppShell title={labels.title} infoPage="goals">
      <SectionTitle title={labels.heading} description={labels.description} />
      <Card><form onSubmit={createGoal} className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2"><FieldLabel label={labels.goalName}><Input name="title" minLength={2} maxLength={60} required /></FieldLabel><FieldLabel label={labels.targetDate}><Input name="targetDate" type="date" min={toDateKey(new Date())} required /></FieldLabel></div>
        <FieldLabel label={labels.category}><Select name="category" defaultValue="productivity"><option value="health">{labels.health}</option><option value="productivity">{labels.productivity}</option><option value="learning">{labels.learning}</option><option value="fitness">{labels.fitness}</option><option value="mental_wellness">{labels.mentalWellness}</option><option value="other">{labels.other}</option></Select></FieldLabel>
        <FieldLabel label={labels.descriptionLabel}><Textarea name="description" maxLength={200} /></FieldLabel>
        <Button type="submit" disabled={mutation.isPending}>{labels.createGoal}</Button>
      </form></Card>
      {error ? <p role="alert" className="text-sm font-semibold text-red-500">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><SectionTitle title={labels.activeGoals} description={labels.activeGoalsDescription} /><div className="grid grid-cols-2 gap-2 sm:flex"><Button variant={period === "month" ? "primary" : "secondary"} onClick={() => setPeriod("month")}>{labels.month}</Button><Button variant={period === "since" ? "primary" : "secondary"} onClick={() => setPeriod("since")}>{labels.sinceCreation}</Button></div></div>
      {dashboard.isLoading ? <Card>Carregando metas…</Card> : null}
      {dashboard.isError ? <Card>Não foi possível carregar as metas.</Card> : null}
      {goals.map((item) => {
        const deadline = goalDeadlineProgress(item.goal);
        const targetDate = item.goal.target_date ? fromDateKey(item.goal.target_date).toLocaleDateString(language, { day: "2-digit", month: "short", year: "numeric" }) : "—";
        const remainingText = deadline.expired
          ? labels.deadlineExpired
          : deadline.daysRemaining === 0
            ? labels.endsToday
            : `${deadline.daysRemaining} ${deadline.daysRemaining === 1 ? labels.dayRemaining : labels.daysRemaining}`;

        return <Card key={item.goal.id} className="grid gap-4">
          <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <div className="min-w-0">
              <Badge tone="green">{labels.categoryLabels[item.goal.category ?? "other"]}</Badge>
              <h2 className="mt-3 break-words font-display text-4xl font-light uppercase [overflow-wrap:anywhere]">{item.goal.title}</h2>
              <p className="mt-2 break-words text-sm text-[var(--text-secondary)]">{item.goal.description || labels.noDescription}</p>
            </div>
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-end gap-4 rounded-2xl bg-[var(--surface-ambient)] p-4 sm:block sm:max-w-56 sm:shrink-0 sm:bg-transparent sm:p-0 sm:text-right">
              <div className="min-w-0">
                <p className="text-3xl font-black">{deadline.percentage}%</p>
                <p className="mt-1 break-words text-xs font-bold uppercase tracking-wide text-[var(--text-tertiary)]">{labels.deadlineProgress}</p>
              </div>
              <div className="min-w-0 text-right sm:mt-3">
                <p className="break-words text-sm font-bold text-[var(--text-secondary)]">{remainingText}</p>
                <p className="mt-1 break-words text-xs text-[var(--text-tertiary)]">{labels.targetDateShort}: {targetDate}</p>
              </div>
            </div>
          </div>
          <ProgressBar value={deadline.percentage} />
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-[var(--text-secondary)]"><span>{item.completed_count} concluídos</span><span>{item.uncompleted_count} não concluídos</span><span>{item.pending_count} pendentes</span></div>
          {detailsGoalId === item.goal.id ? <div className="grid min-w-0 gap-3 overflow-hidden rounded-2xl bg-[var(--surface-ambient)] p-2 sm:p-4">{details.isLoading ? <p>Carregando hábitos…</p> : details.data?.map((habit) => <HabitCard key={habit.habit.id} item={habit} preferredTime={preferredTimes[habit.habit.id]} />)}</div> : null}
          <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setDetailsGoalId(detailsGoalId === item.goal.id ? null : item.goal.id)}>Detalhes</Button><Button variant="secondary" onClick={() => openEdit(item.goal.id)}>Editar</Button><Button variant="danger" onClick={() => { if (window.confirm("Excluir esta meta permanentemente?")) mutation.mutate(() => routineApi.deleteGoal(item.goal.id)); }}>Excluir</Button><Button onClick={() => setHabitGoalId(item.goal.id)}>{labels.addHabit}</Button></div>
          {habitGoalId === item.goal.id ? <form onSubmit={(event) => createHabit(event, item.goal.id)} className="grid gap-3 rounded-3xl border border-[var(--border-soft)] p-4">
            <FieldLabel label={habitsLabels.habitName}><Input name="name" minLength={2} maxLength={60} required /></FieldLabel>
            <div className="grid gap-3 sm:grid-cols-3"><DurationInput name="duration" label={common.duration} defaultMinutes={20} /><FieldLabel label="Data inicial"><Input name="startDate" type="date" min={toDateKey(new Date())} defaultValue={toDateKey(new Date())} required /></FieldLabel><FieldLabel label={habitsLabels.preferredTime}><TimeInput name="preferredTime" defaultValue="08:00" /></FieldLabel></div>
            <FieldLabel label={labels.recurrence}><Select value={recurrence} onChange={(event) => setRecurrence(event.target.value as RecurrenceFrequency)}><option value="daily">Diário</option><option value="weekly">{labels.weekly}</option><option value="monthly">{labels.monthly}</option><option value="yearly">Anual</option></Select></FieldLabel>
            {recurrence === "weekly" ? <DayPicker name="weekDays" count={7} defaults={[1,2,3,4,5]} /> : recurrence === "monthly" ? <DayPicker name="monthDays" count={31} defaults={[1]} /> : null}
            <FieldLabel label={habitsLabels.reason}><Textarea name="description" maxLength={200} /></FieldLabel>
            <div className="grid grid-cols-2 gap-2"><Button type="button" variant="secondary" onClick={() => setHabitGoalId(null)}>Cancelar</Button><Button type="submit">{labels.createHabit}</Button></div>
          </form> : null}
        </Card>;
      })}
      {!dashboard.isLoading && !goals.length ? <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} /> : null}
      {editingGoal ? <div className="fixed inset-0 z-50 grid place-items-end bg-black/55 p-4 backdrop-blur-md sm:place-items-center"><Card className="alfredModalSurface w-full max-w-lg"><form onSubmit={saveGoal} className="grid gap-3"><h2 className="text-xl font-bold">Editar meta</h2><FieldLabel label={labels.goalName}><Input name="title" defaultValue={editingGoal.title} required /></FieldLabel><FieldLabel label={labels.targetDate}><Input name="targetDate" type="date" min={toDateKey(new Date())} defaultValue={editingGoal.target_date ?? ""} required /></FieldLabel><FieldLabel label={labels.category}><Select name="category" defaultValue={editingGoal.category ?? "other"}><option value="health">{labels.health}</option><option value="productivity">{labels.productivity}</option><option value="learning">{labels.learning}</option><option value="fitness">{labels.fitness}</option><option value="mental_wellness">{labels.mentalWellness}</option><option value="other">{labels.other}</option></Select></FieldLabel><FieldLabel label={labels.descriptionLabel}><Textarea name="description" defaultValue={editingGoal.description ?? ""} /></FieldLabel><div className="grid grid-cols-2 gap-2"><Button type="button" variant="secondary" onClick={() => setEditingGoal(null)}>Cancelar</Button><Button type="submit">Salvar</Button></div></form></Card></div> : null}
    </AppShell>
  );
}

function DayPicker({ name, count, defaults }: { name: string; count: number; defaults: number[] }) {
  return <div className="grid grid-cols-7 gap-1.5">{Array.from({ length: count }, (_, index) => count === 7 ? index : index + 1).map((day) => <label key={day} className="grid min-h-10 place-items-center rounded-2xl bg-[var(--surface-ambient)] text-xs font-bold"><input className="peer sr-only" type="checkbox" name={name} value={day} defaultChecked={defaults.includes(day)} /><span className="grid size-full place-items-center rounded-2xl peer-checked:bg-[var(--text-primary)] peer-checked:text-[var(--background-primary)]">{count === 7 ? ["D","S","T","Q","Q","S","S"][day] : day}</span></label>)}</div>;
}
