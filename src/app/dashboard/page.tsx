"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { useAuth } from "@/components/app/AuthProvider";
import { HabitCard } from "@/components/app/HabitCard";
import { useLanguage, useTranslations } from "@/components/app/LanguageProvider";
import { RoutineCard } from "@/components/app/RoutineCard";
import { SectionTitle } from "@/components/app/SectionTitle";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getMotivationalQuoteForDay } from "@/data/motivationalQuotes";
import { agendaEntries } from "@/lib/agenda";
import { toDateKey, weekRange } from "@/lib/date";
import { routineApi } from "@/lib/routineApi";

function yearProgress(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1); const end = new Date(date.getFullYear() + 1, 0, 1);
  const day = Math.floor((date.getTime() - start.getTime()) / 86_400_000) + 1;
  const total = Math.floor((end.getTime() - start.getTime()) / 86_400_000);
  return { day, total, percentage: Math.round(day / total * 100) };
}

export default function DashboardPage() {
  const labels = useTranslations("dashboard");
  const { language } = useLanguage();
  const { user } = useAuth();
  const today = toDateKey(new Date()); const week = weekRange(); const progress = yearProgress();
  const quote = getMotivationalQuoteForDay(progress.day, language);
  const agenda = useQuery({ queryKey: ["agenda", today, today], queryFn: () => routineApi.agenda(today, today) });
  const habits = useQuery({ queryKey: ["habits-dashboard", week.start, week.end], queryFn: () => routineApi.habitsDashboard(week.start, week.end) });
  const entries = agendaEntries(agenda.data);
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const currentIndex = entries.findIndex((entry) => { const [h,m] = entry.time.split(":").map(Number); return entry.status === "pending" && nowMinutes >= h*60+m && nowMinutes < h*60+m+entry.durationMinutes; });
  const ordered = currentIndex >= 0 ? entries.slice(currentIndex) : entries.filter((entry) => entry.status === "pending");

  return <AppShell title={labels.title} showTitle={false} mainClassName="lg:gap-10">
    <div className="flex flex-wrap items-end gap-4"><h1 className="display-title metallicPageTitle text-[3.25rem] sm:text-7xl">{labels.title}</h1><p className="pb-2 text-[var(--text-tertiary)]">{new Date().toLocaleDateString(language, { day: "2-digit", month: "long", year: "numeric" })}</p></div>
    <section className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]"><div className="grid gap-5 py-4"><p className="text-xs font-extrabold uppercase text-[var(--text-secondary)]">{labels.greeting}, {user?.display_name || user?.email}</p><p className="newspaperQuote text-[3.25rem] leading-[.9] sm:text-7xl">“{quote.quote}”</p><p className="text-xs font-extrabold uppercase">{quote.author}</p></div><Card className="grid gap-5"><div className="flex justify-between"><div><p className="label-micro">{labels.yearProgress}</p><h2 className="display-title mt-3 text-5xl">{progress.day}/{progress.total}</h2></div><p className="text-4xl">{progress.percentage}%</p></div><ProgressBar value={progress.percentage} /></Card></section>
    <section className="grid gap-3 sm:grid-cols-3"><Button href="/feedback">{labels.openFeedback}</Button><Button href="/assistant" variant="secondary">{labels.assistantShortcut}</Button><Button href="/habits" variant="secondary">{labels.habitsShortcut}</Button></section>
    <section className="grid gap-5"><SectionTitle title={labels.now} />{ordered[0] ? <RoutineCard entry={ordered[0]} isCurrent={currentIndex >= 0} /> : <EmptyState title={labels.emptyRoutineTitle} description={labels.emptyRoutineDescription} href="/routine" />}{ordered.length > 1 ? <><SectionTitle title={labels.next} />{ordered.slice(1,4).map((entry) => <RoutineCard key={entry.key} entry={entry} />)}</> : null}</section>
    <section className="grid gap-5"><SectionTitle title={labels.habits} description={labels.overviewText} />{habits.data?.habits.length ? <div className="grid gap-4 lg:grid-cols-2">{habits.data.habits.slice(0,2).map((item) => <HabitCard key={item.habit.id} item={item} />)}</div> : <EmptyState title={labels.emptyHabitsTitle} description={labels.emptyHabitsDescription} href="/habits" />}</section>
  </AppShell>;
}
