"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { InteractiveRoutineCalendar } from "@/components/app/InteractiveRoutineCalendar";
import { useLanguage, useTranslations } from "@/components/app/LanguageProvider";
import { RoutineCard } from "@/components/app/RoutineCard";
import { SectionTitle } from "@/components/app/SectionTitle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldLabel, Input, Select, Textarea, TimeSelect } from "@/components/ui/Form";
import { ApiError } from "@/lib/api";
import type { ItemStatus, ItemType, RoutineItem, ScheduleType } from "@/lib/api-contracts";
import { agendaEntries, type AgendaEntry } from "@/lib/agenda";
import { addDays, fromDateKey, toDateKey, toLocalDateTime, weekRange } from "@/lib/date";
import { preferredHabitTimes, readHabitPreferences } from "@/lib/habitPreferences";
import { buildRRule, parseRRule, type RecurrenceFrequency } from "@/lib/rrule";
import { routineApi } from "@/lib/routineApi";

type View = "day" | "week";
const editableHistoryDays = 7;

function localInputParts(iso: string) {
  const date = new Date(iso);
  return { date: toDateKey(date), time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}` };
}

function nextQuarterHour() {
  const date = new Date();
  date.setSeconds(0, 0);
  date.setMinutes(Math.ceil((date.getMinutes() + 1) / 15) * 15);
  return { date: toDateKey(date), time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}` };
}

export default function RoutinePage() {
  const labels = useTranslations("routine");
  const statusLabels = useTranslations("routineCard");
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const today = toDateKey(new Date());
  const tomorrow = toDateKey(addDays(new Date(), 1));
  const oldestEditableDate = toDateKey(addDays(new Date(), -editableHistoryDays));
  const [view, setView] = useState<View>("day");
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<RoutineItem | null>(null);
  const [scheduleType, setScheduleType] = useState<ScheduleType>("single");
  const [recurrence, setRecurrence] = useState<RecurrenceFrequency>("weekly");
  const [defaultRecurrence, setDefaultRecurrence] = useState<RecurrenceFrequency>("weekly");
  const [error, setError] = useState("");
  const [habitPreferences] = useState(readHabitPreferences);
  const habitTimes = useMemo(() => preferredHabitTimes(habitPreferences), [habitPreferences]);
  const week = weekRange(fromDateKey(selectedDate));
  const range = view === "week" ? week : { start: selectedDate, end: selectedDate };
  const monthStart = toDateKey(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1));
  const monthEnd = toDateKey(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0));

  const agenda = useQuery({ queryKey: ["agenda", range.start, range.end], queryFn: () => routineApi.agenda(range.start, range.end) });
  const monthAgenda = useQuery({ queryKey: ["agenda", monthStart, monthEnd], queryFn: () => routineApi.agenda(monthStart, monthEnd) });
  const items = useQuery({ queryKey: ["routine-items"], queryFn: routineApi.listItems });
  const goals = useQuery({ queryKey: ["goals"], queryFn: routineApi.listGoals });
  const entries = useMemo(() => agendaEntries(agenda.data, habitTimes), [agenda.data, habitTimes]);
  const monthEntries = useMemo(() => agendaEntries(monthAgenda.data, habitTimes), [habitTimes, monthAgenda.data]);

  function refresh() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ["agenda"] }),
      queryClient.invalidateQueries({ queryKey: ["routine-items"] }),
      queryClient.invalidateQueries({ queryKey: ["habits-dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["goals-dashboard"] }),
    ]);
  }
  const mutation = useMutation({ mutationFn: async (action: () => Promise<unknown>) => action(), onSuccess: refresh, onError: (cause) => setError(cause instanceof ApiError ? cause.detail : "Não foi possível concluir a ação.") });

  function openCreate() {
    setEditing(null); setScheduleType("single"); setRecurrence("weekly"); setError(""); setEditorOpen(true);
  }

  function openDate(date: string) {
    const parsed = fromDateKey(date);
    setSelectedDate(date);
    setVisibleMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
    setView("day");
  }
  async function openEdit(entry: AgendaEntry) {
    setError("");
    try {
      const item = await routineApi.getItem(entry.sourceId);
      setEditing(item); setScheduleType(item.schedule_type);
      setRecurrence(item.recurrence_rule ? parseRRule(item.recurrence_rule).frequency : "weekly");
      setEditorOpen(true);
    } catch (cause) { setError(cause instanceof ApiError ? cause.detail : "Não foi possível carregar o item."); }
  }

  function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const data = new FormData(event.currentTarget);
    const startDate = String(data.get("startDate"));
    const startTime = String(data.get("startTime"));
    const endDate = String(data.get("endDate"));
    const selected = data.getAll(recurrence === "monthly" ? "monthDays" : "weekDays").map(Number);
    const startAt = toLocalDateTime(startDate, startTime);
    if (!editing && new Date(startAt) < new Date()) { setError("O início não pode estar no passado."); return; }
    const payload = {
      schedule_type: scheduleType,
      start_at: startAt,
      end_at: scheduleType === "recurring" ? toLocalDateTime(endDate, startTime) : null,
      recurrence_rule: scheduleType === "recurring" ? buildRRule(recurrence, selected) : null,
      duration_minutes: Number(data.get("duration")), item_type: data.get("itemType") as ItemType,
      description: String(data.get("description")) || null, title: String(data.get("title")),
      goal_id: String(data.get("goalId")) || null,
    };
    mutation.mutate(() => editing ? routineApi.updateItem(editing.id, payload) : routineApi.createItem(payload), { onSuccess: () => { setEditorOpen(false); setEditing(null); } });
  }

  function log(entry: AgendaEntry, status: ItemStatus) {
    mutation.mutate(() => entry.source === "habit" ? routineApi.logHabit(entry.sourceId, entry.date, status) : routineApi.logItem(entry.sourceId, entry.date, status));
  }
  function isCurrent(entry: AgendaEntry) {
    if (entry.date !== today || entry.status !== "pending") return false;
    const [hour, minute] = entry.time.split(":").map(Number);
    const start = hour * 60 + minute;
    const now = new Date(); const current = now.getHours() * 60 + now.getMinutes();
    return current >= start && current < start + entry.durationMinutes;
  }
  function applyVacation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const selected = data.getAll("itemIds").map(String);
    if (!selected.length) { setError("Selecione pelo menos um item recorrente."); return; }
    mutation.mutate(() => routineApi.setVacation(selected, String(data.get("vacationStart")), String(data.get("vacationEnd"))), { onSuccess: () => event.currentTarget.reset() });
  }

  function saveDefaultRoutineItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const selected = data.getAll(defaultRecurrence === "monthly" ? "defaultMonthDays" : "defaultWeekDays").map(Number);
    const time = String(data.get("defaultTime") || "08:00");
    const now = new Date();
    const startDate = time <= `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}` ? tomorrow : today;
    mutation.mutate(() => routineApi.createItem({
      schedule_type: "recurring",
      start_at: toLocalDateTime(startDate, time),
      end_at: toLocalDateTime(toDateKey(addDays(new Date(), 365)), time),
      recurrence_rule: buildRRule(defaultRecurrence, selected),
      item_type: "event",
      description: String(data.get("defaultDescription")) || null,
      title: String(data.get("defaultTitle")),
      goal_id: null,
      duration_minutes: Number(data.get("defaultDuration") || 60),
    }), { onSuccess: () => { form.reset(); setDefaultRecurrence("weekly"); } });
  }

  const editingParts = editing ? localInputParts(editing.start_at) : null;
  const editingRecurrence = editing?.recurrence_rule ? parseRRule(editing.recurrence_rule) : null;
  const suggestedStart = nextQuarterHour();
  const defaultDate = selectedDate < today ? today : selectedDate;
  const maxEndDate = toDateKey(addDays(new Date(), 365));
  const suggestedEndDate = toDateKey(addDays(fromDateKey(defaultDate), 30));
  const defaultEndDate = suggestedEndDate > maxEndDate ? maxEndDate : suggestedEndDate;
  const recurringItems = items.data?.filter((item) => item.schedule_type === "recurring") ?? [];
  const selectedDateLong = fromDateKey(selectedDate).toLocaleDateString(language, { weekday: "long", day: "2-digit", month: "long" });
  const isReadOnlyHistory = view === "day" && selectedDate < oldestEditableDate;
  return (
    <AppShell title={labels.title}>
      <InteractiveRoutineCalendar
        selectedDate={selectedDate}
        visibleMonth={visibleMonth}
        entries={monthEntries}
        months={labels.months}
        weekdays={labels.weekdays}
        title={labels.calendar}
        correctionWindowStart={oldestEditableDate}
        correctionWindowHint={labels.correctionWindowHint}
        onSelectDate={openDate}
        onMonthChange={setVisibleMonth}
      />
      <Card><div className="flex flex-wrap items-start justify-between gap-4"><div className="grid gap-2"><h2 className="font-display text-4xl font-light uppercase leading-[0.92] text-[var(--text-primary)]"><span>{labels.timeline}</span>{view === "day" ? <><span aria-hidden="true"> · </span><span className="text-[var(--text-secondary)]">{selectedDateLong}</span></> : null}</h2><p className="subtitle-display max-w-3xl text-lg text-[var(--text-secondary)]">{labels.description}</p></div><Button onClick={openCreate}>{labels.newBlock}</Button></div><div className="mt-5 grid grid-cols-3 gap-2"><Button variant={view === "day" && selectedDate === today ? "primary" : "secondary"} onClick={() => openDate(today)}>Hoje</Button><Button variant={view === "day" && selectedDate === tomorrow ? "primary" : "secondary"} onClick={() => openDate(tomorrow)}>Amanhã</Button><Button variant={view === "week" ? "primary" : "secondary"} onClick={() => setView("week")}>Semana</Button></div></Card>
      {error ? <p role="alert" className="text-sm font-semibold text-red-500">{error}</p> : null}
      {agenda.isLoading ? <Card>Carregando agenda…</Card> : null}
      {isReadOnlyHistory ? <Card role="alert" aria-live="polite" className="border-red-500/35 bg-red-500/[0.07]"><div className="flex items-start gap-3"><span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full border border-red-400/50 bg-red-500/10 font-black text-red-400">!</span><div><h3 className="font-black text-red-400">{labels.historyReadOnlyTitle}</h3><p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">{labels.historyReadOnly}</p></div></div></Card> : null}
      {view === "week" ? Array.from({ length: 7 }, (_, index) => addDays(fromDateKey(range.start), index)).map((date) => {
        const key = toDateKey(date); const dayEntries = entries.filter((entry) => entry.date === key);
        return <Card key={key}><div className="flex items-center justify-between"><Badge tone={key === today ? "green" : "blue"}>{date.toLocaleDateString(language, { weekday: "long", day: "2-digit", month: "2-digit" })}</Badge><span className="text-xs font-bold text-[var(--text-tertiary)]">{dayEntries.length} itens</span></div><div className="mt-4 grid gap-2">{dayEntries.map((entry) => <div key={entry.key} className="flex justify-between rounded-2xl bg-[var(--surface-ambient)] px-4 py-3"><strong>{entry.time} · {entry.title}</strong><span className="text-xs">{{ completed: statusLabels.done, uncompleted: statusLabels.missed, pending: statusLabels.pending, vacation: statusLabels.vacation }[entry.status]}</span></div>)}</div></Card>;
      }) : entries.map((entry) => {
        const canLog = entry.date >= oldestEditableDate && entry.date <= today;
        const canChangeItem = entry.source === "item" && entry.date >= oldestEditableDate;
        return <RoutineCard key={entry.key} entry={entry} isCurrent={isCurrent(entry)} onDone={canLog ? (current) => log(current, current.status === "completed" ? "pending" : "completed") : undefined} onSkip={canLog ? (current) => log(current, "uncompleted") : undefined} onEdit={canChangeItem ? openEdit : undefined} onDelete={canChangeItem ? (current) => { if (window.confirm("Excluir este item permanentemente?")) mutation.mutate(() => routineApi.deleteItem(current.sourceId)); } : undefined} />;
      })}
      {!agenda.isLoading && !entries.length ? <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} /> : null}

      <Card className="grid gap-4">
        <SectionTitle title={labels.defaultRoutine} description={labels.defaultRoutineDescription} />
        {recurringItems.length ? <div className="grid gap-2">{recurringItems.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-ambient)] px-4 py-3"><div><p className="font-bold">{localInputParts(item.start_at).time} · {item.title}</p><p className="mt-1 text-xs text-[var(--text-tertiary)]">{item.duration_minutes} min · {item.recurrence_rule}</p></div><Button variant="ghost" className="min-h-10 px-3 text-xs" onClick={() => { if (window.confirm("Remover este item da rotina padrão?")) mutation.mutate(() => routineApi.deleteItem(item.id)); }}>{labels.remove}</Button></div>)}</div> : null}
        <form onSubmit={saveDefaultRoutineItem} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2"><FieldLabel label={labels.titleField}><Input name="defaultTitle" placeholder={labels.defaultRoutinePlaceholder} minLength={2} maxLength={150} required /></FieldLabel><FieldLabel label={labels.time}><TimeSelect name="defaultTime" defaultValue="08:00" required /></FieldLabel></div>
          <div className="grid gap-3 sm:grid-cols-2"><FieldLabel label={labels.duration}><Input name="defaultDuration" type="number" min={1} max={1440} defaultValue={60} required /></FieldLabel><FieldLabel label={labels.recurrence}><Select value={defaultRecurrence} onChange={(event) => setDefaultRecurrence(event.target.value as RecurrenceFrequency)}><option value="weekly">{labels.weekly}</option><option value="monthly">{labels.monthly}</option></Select></FieldLabel></div>
          <FieldLabel label={labels.descriptionField}><Textarea name="defaultDescription" placeholder={labels.defaultRoutineDescriptionPlaceholder} maxLength={200} /></FieldLabel>
          {defaultRecurrence === "weekly" ? <DayPicker name="defaultWeekDays" count={7} defaults={[1,2,3,4,5]} /> : <DayPicker name="defaultMonthDays" count={31} defaults={[1]} />}
          <Button type="submit" disabled={mutation.isPending}>{labels.addDefaultRoutineItem}</Button>
        </form>
      </Card>

      <Card className="grid gap-4"><SectionTitle title={labels.vacationPeriod} description={labels.vacationDescription} />
        <form onSubmit={applyVacation} className="grid gap-4"><div className="grid grid-cols-2 gap-3"><FieldLabel label={labels.startDate}><Input name="vacationStart" type="date" min={today} required /></FieldLabel><FieldLabel label={labels.endDate}><Input name="vacationEnd" type="date" min={today} required /></FieldLabel></div><div className="grid gap-2 sm:grid-cols-2">{recurringItems.map((item) => <label key={item.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] p-4"><input type="checkbox" name="itemIds" value={item.id} className="size-5" /><span><strong className="block">{item.title}</strong><span className="text-xs text-[var(--text-tertiary)]">{item.recurrence_rule}</span></span></label>)}</div>{recurringItems.length ? <Button type="submit" variant="secondary" disabled={mutation.isPending}>{labels.saveVacation}</Button> : <p className="text-sm text-[var(--text-secondary)]">{labels.noVacationItems}</p>}</form>
      </Card>

      {editorOpen ? <div className="fixed inset-0 z-50 grid place-items-end bg-black/55 p-4 backdrop-blur-md sm:place-items-center"><Card className="alfredModalSurface max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto"><form onSubmit={saveItem} className="grid gap-3"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">{editing ? labels.editBlock : labels.newBlock}</h2><Button type="button" variant="ghost" onClick={() => setEditorOpen(false)}>{labels.close}</Button></div>
        <FieldLabel label={labels.titleField}><Input name="title" defaultValue={editing?.title ?? ""} minLength={2} maxLength={150} required /></FieldLabel>
        <FieldLabel label={labels.descriptionField}><Textarea name="description" defaultValue={editing?.description ?? ""} maxLength={200} /></FieldLabel>
        <div className="grid grid-cols-2 gap-3"><FieldLabel label="Tipo de agenda"><Select value={scheduleType} onChange={(event) => setScheduleType(event.target.value as ScheduleType)}><option value="single">Único</option><option value="recurring">Recorrente</option></Select></FieldLabel><FieldLabel label="Tipo de item"><Select name="itemType" defaultValue={editing?.item_type ?? "task"}><option value="task">Tarefa</option><option value="event">Evento</option><option value="reminder">Lembrete</option></Select></FieldLabel></div>
        <div className="grid grid-cols-2 gap-3"><FieldLabel label={labels.startDate}><Input name="startDate" type="date" min={today} defaultValue={editingParts?.date ?? defaultDate} required /></FieldLabel><FieldLabel label={labels.time}><TimeSelect name="startTime" defaultValue={editingParts?.time ?? (selectedDate === tomorrow ? "09:00" : suggestedStart.time)} required /></FieldLabel></div>
        <div className="grid grid-cols-2 gap-3"><FieldLabel label="Duração (min)"><Input name="duration" type="number" min={1} max={1440} defaultValue={editing?.duration_minutes ?? 30} required /></FieldLabel><FieldLabel label="Meta opcional"><Select name="goalId" defaultValue={editing?.goal_id ?? ""}><option value="">Sem meta</option>{goals.data?.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}</Select></FieldLabel></div>
        {scheduleType === "recurring" ? <><div className="grid grid-cols-2 gap-3"><FieldLabel label={labels.endDate}><Input name="endDate" type="date" min={editingParts?.date ?? defaultDate} max={maxEndDate} defaultValue={editing?.end_at ? localInputParts(editing.end_at).date : defaultEndDate} required /></FieldLabel><FieldLabel label={labels.recurrence}><Select value={recurrence} onChange={(event) => setRecurrence(event.target.value as RecurrenceFrequency)}><option value="daily">Diário</option><option value="weekly">Semanal</option><option value="monthly">Mensal</option><option value="yearly">Anual</option></Select></FieldLabel></div>{recurrence === "weekly" ? <DayPicker name="weekDays" count={7} defaults={editingRecurrence?.frequency === "weekly" ? editingRecurrence.selected : [1,2,3,4,5]} /> : recurrence === "monthly" ? <DayPicker name="monthDays" count={31} defaults={editingRecurrence?.frequency === "monthly" ? editingRecurrence.selected : [1]} /> : null}</> : null}
        <Button type="submit" disabled={mutation.isPending}>{labels.save}</Button>
      </form></Card></div> : null}
    </AppShell>
  );
}

function DayPicker({ name, count, defaults }: { name: string; count: number; defaults: number[] }) {
  return <div className="grid grid-cols-7 gap-1.5">{Array.from({ length: count }, (_, index) => count === 7 ? index : index + 1).map((day) => <label key={day} className="grid min-h-10 place-items-center rounded-2xl bg-[var(--surface-ambient)] text-xs font-bold"><input className="peer sr-only" type="checkbox" name={name} value={day} defaultChecked={defaults.includes(day)} /><span className="grid size-full place-items-center rounded-2xl peer-checked:bg-[var(--text-primary)] peer-checked:text-[var(--background-primary)]">{count === 7 ? ["D","S","T","Q","Q","S","S"][day] : day}</span></label>)}</div>;
}
