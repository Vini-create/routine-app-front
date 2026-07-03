"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { useLanguage, useTranslations } from "@/components/app/LanguageProvider";
import { SectionTitle } from "@/components/app/SectionTitle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { agendaEntries } from "@/lib/agenda";
import { addDays, fromDateKey, toDateKey, weekRange } from "@/lib/date";
import { routineApi } from "@/lib/routineApi";

export default function CalendarPage() {
  const labels = useTranslations("calendarPage"); const { language } = useLanguage(); const range = weekRange();
  const statusLabels = useTranslations("routineCard");
  const agenda = useQuery({ queryKey: ["agenda", range.start, range.end], queryFn: () => routineApi.agenda(range.start, range.end) });
  const entries = agendaEntries(agenda.data);
  return <AppShell title={labels.title}><div className="flex items-center justify-between gap-4"><SectionTitle title={labels.heading} description={labels.description} /><Button href="/assistant">{labels.reorganize}</Button></div><div className="grid gap-4">{Array.from({length:7},(_,i)=>addDays(fromDateKey(range.start),i)).map((date)=>{const key=toDateKey(date);const day=entries.filter((entry)=>entry.date===key);return <Card key={key}><div className="flex justify-between"><Badge tone={key===toDateKey(new Date())?"green":"blue"}>{date.toLocaleDateString(language,{weekday:"long",day:"2-digit",month:"2-digit"})}</Badge><Badge tone="neutral">{day.length} {labels.blocks}</Badge></div><div className="mt-4 grid gap-2">{day.map((entry)=><div key={entry.key} className="flex items-center justify-between rounded-2xl bg-[var(--surface-ambient)] px-4 py-3"><span><strong>{entry.time} · {entry.title}</strong>{entry.source==="habit"?<small className="ml-2">Hábito</small>:null}</span><span className="text-xs font-bold">{{ completed: statusLabels.done, uncompleted: statusLabels.missed, pending: statusLabels.pending, vacation: statusLabels.vacation }[entry.status]}</span></div>)}{!day.length?<p className="text-sm text-[var(--text-tertiary)]">Sem itens.</p>:null}</div></Card>})}{agenda.isError?<EmptyState title={labels.emptyTitle} description={labels.emptyDescription} href="/routine" />:null}</div></AppShell>;
}
