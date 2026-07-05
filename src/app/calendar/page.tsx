"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { InteractiveRoutineCalendar } from "@/components/app/InteractiveRoutineCalendar";
import { useLanguage, useTranslations } from "@/components/app/LanguageProvider";
import { SectionTitle } from "@/components/app/SectionTitle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { agendaEntries } from "@/lib/agenda";
import { fromDateKey, toDateKey } from "@/lib/date";
import { preferredHabitTimes, readHabitPreferences } from "@/lib/habitPreferences";
import { routineApi } from "@/lib/routineApi";

export default function CalendarPage() {
  const labels = useTranslations("calendarPage");
  const routineLabels = useTranslations("routine");
  const statusLabels = useTranslations("routineCard");
  const { language } = useLanguage();
  const today = toDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [preferences] = useState(readHabitPreferences);
  const preferredTimes = useMemo(() => preferredHabitTimes(preferences), [preferences]);
  const monthStart = toDateKey(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1));
  const monthEnd = toDateKey(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0));
  const agenda = useQuery({ queryKey: ["agenda", monthStart, monthEnd], queryFn: () => routineApi.agenda(monthStart, monthEnd) });
  const entries = useMemo(() => agendaEntries(agenda.data, preferredTimes), [agenda.data, preferredTimes]);
  const selectedEntries = entries.filter((entry) => entry.date === selectedDate);

  function openDate(date: string) {
    const parsed = fromDateKey(date);
    setSelectedDate(date);
    setVisibleMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
  }

  return (
    <AppShell title={labels.title} infoPage="calendar">
      <div className="flex items-center justify-between gap-4"><SectionTitle title={labels.heading} description={labels.description} /><Button href="/assistant">{labels.reorganize}</Button></div>
      <div data-tour="calendar-main"><InteractiveRoutineCalendar selectedDate={selectedDate} visibleMonth={visibleMonth} entries={entries} months={routineLabels.months} weekdays={routineLabels.weekdays} title={routineLabels.calendar} itemTypeLabels={routineLabels.itemTypes} onSelectDate={openDate} onMonthChange={setVisibleMonth} /></div>
      <Card data-tour="calendar-day">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">{selectedDate}</p><h2 className="mt-1 text-xl font-black capitalize">{fromDateKey(selectedDate).toLocaleDateString(language, { weekday: "long", day: "2-digit", month: "long" })}</h2></div><Badge tone="neutral">{selectedEntries.length} {labels.blocks}</Badge></div>
        <div className="mt-5 grid gap-2">{selectedEntries.map((entry) => <div key={entry.key} className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--surface-ambient)] px-4 py-3"><span><strong>{entry.time} · {entry.title}</strong>{entry.source === "habit" ? <small className="ml-2 text-[var(--text-tertiary)]">Hábito</small> : null}</span><span className="text-xs font-bold">{{ completed: statusLabels.done, uncompleted: statusLabels.missed, pending: statusLabels.pending, vacation: statusLabels.vacation }[entry.status]}</span></div>)}</div>
        {!agenda.isLoading && !selectedEntries.length ? <p className="mt-5 text-sm text-[var(--text-tertiary)]">Sem itens para este dia.</p> : null}
      </Card>
      {agenda.isError ? <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} href="/routine" /> : null}
    </AppShell>
  );
}
