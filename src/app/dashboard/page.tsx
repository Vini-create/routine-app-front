"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { PageInfoButton } from "@/components/app/PageInfoButton";
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
import { addDays, fromDateKey, toDateKey, weekRange } from "@/lib/date";
import { preferredHabitTimes, readHabitPreferences } from "@/lib/habitPreferences";
import { routineApi } from "@/lib/routineApi";

function yearProgress(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear() + 1, 0, 1);
  const day = Math.floor((date.getTime() - start.getTime()) / 86_400_000) + 1;
  const total = Math.floor((end.getTime() - start.getTime()) / 86_400_000);

  return { day, total, percentage: Math.round((day / total) * 100) };
}

export default function DashboardPage() {
  const labels = useTranslations("dashboard");
  const { language } = useLanguage();
  const { user } = useAuth();
  const today = toDateKey(new Date());
  const week = weekRange();
  const progress = yearProgress();
  const quote = getMotivationalQuoteForDay(progress.day, language);
  const [habitPreferences] = useState(readHabitPreferences);
  const preferredTimes = useMemo(() => preferredHabitTimes(habitPreferences), [habitPreferences]);

  const agenda = useQuery({
    queryKey: ["agenda", week.start, week.end],
    queryFn: () => routineApi.agenda(week.start, week.end),
  });
  const habits = useQuery({
    queryKey: ["habits-dashboard", week.start, week.end],
    queryFn: () => routineApi.habitsDashboard(week.start, week.end),
  });

  const weekEntries = useMemo(() => agendaEntries(agenda.data, preferredTimes), [agenda.data, preferredTimes]);
  const todayEntries = weekEntries.filter((entry) => entry.date === today);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const currentIndex = todayEntries.findIndex((entry) => {
    const [hour, minute] = entry.time.split(":").map(Number);
    const start = hour * 60 + minute;
    return entry.status === "pending" && nowMinutes >= start && nowMinutes < start + entry.durationMinutes;
  });
  const ordered = currentIndex >= 0
    ? todayEntries.slice(currentIndex)
    : todayEntries.filter((entry) => entry.status === "pending");

  const weeklyPlan = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = addDays(fromDateKey(week.start), index);
    const key = toDateKey(date);
    const blocks = weekEntries.filter((entry) => entry.date === key);

    return {
      key,
      day: date.toLocaleDateString(language, { weekday: "long" }),
      focus: blocks[0]?.title ?? "—",
      blocks,
    };
  }), [language, week.start, weekEntries]);

  const hasWeeklyPlan = weeklyPlan.some((day) => day.blocks.length > 0);
  const elapsedWeekEntries = weekEntries.filter((entry) => entry.date <= today && entry.status !== "vacation");
  const weekCompleted = elapsedWeekEntries.filter((entry) => entry.status === "completed").length;

  return (
    <AppShell title={labels.title} showTitle={false} mainClassName="lg:gap-10">
      <div className="flex min-w-0 flex-wrap items-end gap-x-5 gap-y-2">
        <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:flex-none sm:gap-4">
          <h1 className="display-title metallicPageTitle min-w-0 flex-1 break-words text-[clamp(2.55rem,12vw,3.25rem)] leading-[0.88] text-[var(--text-primary)] [overflow-wrap:anywhere] sm:text-7xl lg:text-[5.35rem]">
            {labels.title}
          </h1>
          <PageInfoButton page="dashboard" className="mt-1" />
        </div>
        <p className="font-display pb-2 text-2xl font-light uppercase leading-none text-[var(--text-tertiary)] sm:pb-3 sm:text-3xl lg:pb-4 lg:text-[2.45rem]">
          {new Date().toLocaleDateString(language, { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end">
        <div className="grid gap-5 py-2 lg:py-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--text-secondary)] sm:text-sm lg:text-[0.95rem]">
            {labels.greeting}, {user?.display_name || user?.email}
          </p>
          <p className="newspaperQuote max-w-4xl text-[3.25rem] leading-[0.9] text-[var(--text-primary)] sm:text-7xl lg:text-[5.4rem]">
            “{quote.quote}”
          </p>
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--text-secondary)] sm:text-sm lg:text-[0.95rem]">
            {quote.author}
          </p>
        </div>

        <Card className="glass-focus grid gap-5 p-6 lg:p-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="label-micro lg:text-xs">{labels.yearProgress}</p>
              <h2 className="display-title mt-3 text-[3.2rem] text-[var(--text-primary)] sm:text-[4rem]">
                {progress.day}/{progress.total}
              </h2>
            </div>
            <div className="text-right">
              <p className="font-display text-[2.75rem] font-light leading-none text-[var(--text-primary)]">{progress.percentage}%</p>
              <p className="mt-2 text-sm font-semibold text-[var(--text-tertiary)]">{labels.yearComplete}</p>
            </div>
          </div>
          <ProgressBar value={progress.percentage} />
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Button href="/feedback" className="sm:text-base">{labels.openFeedback}</Button>
        <Button href="/assistant" variant="secondary" className="sm:text-base">{labels.assistantShortcut}</Button>
        <Button href="/habits" variant="secondary" className="sm:text-base">{labels.habitsShortcut}</Button>
      </section>

      <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)] lg:items-start">
        <div className="grid gap-5">
          <SectionTitle title={labels.now} />
          {agenda.isLoading ? (
            <Card><p className="text-base text-[var(--text-secondary)]">{labels.loadingRoutine}</p></Card>
          ) : ordered[0] ? (
            <RoutineCard entry={ordered[0]} isCurrent={currentIndex >= 0} />
          ) : (
            <EmptyState title={labels.emptyRoutineTitle} description={labels.emptyRoutineDescription} href="/routine" />
          )}

          {ordered.length > 1 ? (
            <div className="grid gap-3">
              <SectionTitle title={labels.next} />
              {ordered.slice(1, 4).map((entry) => <RoutineCard key={entry.key} entry={entry} />)}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4">
          <Card className="grid gap-4 p-6 lg:p-7">
            <div>
              <p className="label-micro lg:text-xs">{labels.overview}</p>
              <h3 className="mt-3 font-display text-3xl font-light uppercase leading-none text-[var(--text-primary)] lg:text-[2.15rem]">
                {labels.routineFeedback}
              </h3>
              <p className="mt-3 text-base leading-7 text-[var(--text-secondary)]">{labels.routineFeedbackText}</p>
            </div>
            <Button href="/feedback" variant="secondary" className="sm:text-base">{labels.openFeedback}</Button>
          </Card>

          <Card className="grid gap-2 p-5 lg:p-6">
            <h3 className="font-display text-2xl font-light uppercase leading-none text-[var(--text-primary)] lg:text-3xl">
              {labels.weeklySummary}
            </h3>
            <p className="text-base leading-7 text-[var(--text-secondary)]">
              {elapsedWeekEntries.length
                ? `${weekCompleted} ${labels.weeklyCompletionConnector} ${elapsedWeekEntries.length} ${labels.weeklyCompletionSuffix}`
                : labels.weeklyText}
            </p>
          </Card>
        </div>
      </section>

      <section className="grid gap-5">
        <SectionTitle title={labels.weeklyPlan} />
        {hasWeeklyPlan ? (
          <div className="grid gap-3 md:grid-cols-3">
            {weeklyPlan.slice(0, 3).map((day) => (
              <Card key={day.key} className="grid gap-3 p-5 lg:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-2xl font-light uppercase leading-none lg:text-3xl">{day.day}</h3>
                  <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-ambient)] px-3 py-1 text-xs font-semibold text-[var(--text-tertiary)] lg:text-sm">
                    {day.blocks.length} {labels.blocks}
                  </span>
                </div>
                <p className="text-base font-semibold text-[var(--text-primary)]">{day.focus}</p>
                <p className="text-sm leading-6 text-[var(--text-tertiary)]">{day.blocks.map((entry) => entry.title).join(" · ") || "—"}</p>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title={labels.emptyWeekTitle} description={labels.emptyWeekDescription} href="/routine" />
        )}
      </section>

      <section className="grid gap-5">
        <SectionTitle title={labels.habits} description={labels.overviewText} />
        {habits.isLoading ? (
          <Card><p className="text-base text-[var(--text-secondary)]">{labels.loadingHabits}</p></Card>
        ) : habits.data?.habits.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {habits.data.habits.slice(0, 2).map((item) => (
              <HabitCard key={item.habit.id} item={item} preferredTime={preferredTimes[item.habit.id]} compact />
            ))}
          </div>
        ) : (
          <EmptyState title={labels.emptyHabitsTitle} description={labels.emptyHabitsDescription} href="/habits" />
        )}
      </section>
    </AppShell>
  );
}
