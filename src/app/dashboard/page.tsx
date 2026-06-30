"use client";

import { AppShell } from "@/components/app/AppShell";
import { HabitCard } from "@/components/app/HabitCard";
import { useLanguage, useTranslations } from "@/components/app/LanguageProvider";
import { RoutineCard } from "@/components/app/RoutineCard";
import { SectionTitle } from "@/components/app/SectionTitle";
import { useAppData } from "@/components/app/useAppData";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getMotivationalQuoteForDay } from "@/data/motivationalQuotes";

function getYearProgress(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear() + 1, 0, 1);
  const day = Math.floor((date.getTime() - start.getTime()) / 86_400_000) + 1;
  const total = Math.floor((end.getTime() - start.getTime()) / 86_400_000);

  return {
    day,
    total,
    percentage: Math.round((day / total) * 100),
  };
}

function formatHomeDate(date = new Date()) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function DashboardPage() {
  const dashboard = useTranslations("dashboard");
  const { language } = useLanguage();
  const { habits, routineBlocks, user, weeklyPlan } = useAppData();
  const yearProgress = getYearProgress();
  const quote = getMotivationalQuoteForDay(yearProgress.day, language);

  return (
    <AppShell title={dashboard.title} showTitle={false} mainClassName="lg:gap-10">
      <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
        <h1 className="display-title metallicPageTitle text-[3.25rem] text-[var(--text-primary)] sm:text-7xl lg:text-[5.35rem]">
          {dashboard.title}
        </h1>
        <p className="font-display pb-2 text-2xl font-light uppercase leading-none text-[var(--text-tertiary)] sm:pb-3 sm:text-3xl lg:pb-4 lg:text-[2.45rem]">
          {formatHomeDate()}
        </p>
      </div>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end">
        <div className="grid gap-5 py-2 lg:py-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--text-secondary)] sm:text-sm">{dashboard.greeting}, {user.name}</p>
          <p className="newspaperQuote max-w-4xl text-[3.25rem] leading-[0.9] text-[var(--text-primary)] sm:text-7xl lg:text-[5.4rem]">
            “{quote.quote}”
          </p>
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--text-secondary)] sm:text-sm">{quote.author}</p>
        </div>

        <Card className="glass-focus grid gap-5 p-6 lg:p-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="label-micro">{dashboard.yearProgress}</p>
              <h2 className="display-title mt-3 text-[3.2rem] text-[var(--text-primary)] sm:text-[4rem]">
                {yearProgress.day}/{yearProgress.total}
              </h2>
            </div>
            <div className="text-right">
              <p className="font-display text-[2.75rem] font-light leading-none text-[var(--text-primary)]">{yearProgress.percentage}%</p>
              <p className="mt-2 text-xs font-semibold text-[var(--text-tertiary)]">{dashboard.yearComplete}</p>
            </div>
          </div>
          <ProgressBar value={yearProgress.percentage} />
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Button href="/feedback">{dashboard.openFeedback}</Button>
        <Button href="/assistant" variant="secondary">{dashboard.assistantShortcut}</Button>
        <Button href="/habits" variant="secondary">{dashboard.habitsShortcut}</Button>
      </section>

      <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)] lg:items-start">
        <div className="grid gap-5">
          <SectionTitle title={dashboard.now} />
          {routineBlocks[0] ? (
            <RoutineCard block={routineBlocks[0]} />
          ) : (
            <EmptyState title={dashboard.emptyRoutineTitle} description={dashboard.emptyRoutineDescription} href="/routine" />
          )}

          {routineBlocks.length > 1 ? (
            <div className="grid gap-3">
              <SectionTitle title={dashboard.next} />
              {routineBlocks.slice(1, 4).map((block) => <RoutineCard key={block.id} block={block} />)}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4">
          <Card className="grid gap-4 p-6">
            <div>
              <p className="label-micro">{dashboard.overview}</p>
              <h3 className="mt-3 font-display text-3xl font-light uppercase leading-none text-[var(--text-primary)]">{dashboard.routineFeedback}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{dashboard.routineFeedbackText}</p>
            </div>
            <Button href="/routine" variant="secondary">{dashboard.recalculate}</Button>
          </Card>

          <Card className="grid gap-2 p-5">
            <h3 className="font-display text-2xl font-light uppercase leading-none text-[var(--text-primary)]">{dashboard.weeklySummary}</h3>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">{dashboard.weeklyText}</p>
          </Card>
        </div>
      </section>

      <section className="grid gap-5">
        <SectionTitle title={dashboard.weeklyPlan} />
        {weeklyPlan.length ? (
          <div className="grid gap-3 md:grid-cols-3">
            {weeklyPlan.slice(0, 3).map((day) => (
              <Card key={day.day} className="grid gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-2xl font-light uppercase leading-none">{day.day}</h3>
                  <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-ambient)] px-3 py-1 text-xs font-semibold text-[var(--text-tertiary)]">{day.blocks.length} {dashboard.blocks}</span>
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{day.focus}</p>
                <p className="text-xs leading-5 text-[var(--text-tertiary)]">{day.blocks.join(" · ")}</p>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title={dashboard.emptyWeekTitle} description={dashboard.emptyWeekDescription} href="/routine" />
        )}
      </section>

      <section className="grid gap-5">
        <SectionTitle title={dashboard.habits} description={dashboard.overviewText} />
        {habits.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {habits.slice(0, 2).map((habit) => <HabitCard key={habit.id} habit={habit} />)}
          </div>
        ) : (
          <EmptyState title={dashboard.emptyHabitsTitle} description={dashboard.emptyHabitsDescription} href="/habits" />
        )}
      </section>
    </AppShell>
  );
}
