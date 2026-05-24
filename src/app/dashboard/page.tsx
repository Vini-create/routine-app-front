"use client";

import { AppShell } from "@/components/app/AppShell";
import { HabitCard } from "@/components/app/HabitCard";
import { useTranslations } from "@/components/app/LanguageProvider";
import { RoutineCard } from "@/components/app/RoutineCard";
import { SectionTitle } from "@/components/app/SectionTitle";
import { useAppData } from "@/components/app/useAppData";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { motivationalQuotes } from "@/data/motivationalQuotes";

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

export default function DashboardPage() {
  const dashboard = useTranslations("dashboard");
  const { habits, routineBlocks, user, weeklyPlan } = useAppData();
  const yearProgress = getYearProgress();
  const quote = motivationalQuotes[(yearProgress.day - 1) % motivationalQuotes.length];

  return (
    <AppShell title={dashboard.title}>
      <section className="border-l-4 border-zinc-950 py-2 pl-5 dark:border-zinc-100">
        <p className="newspaperQuote text-[2.85rem] leading-[0.95] text-zinc-950 dark:text-zinc-50 sm:text-7xl">
          “{quote.quote}”
        </p>
        <p className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">{quote.author}</p>
      </section>

      <Card className="grid gap-4 border-zinc-800 bg-zinc-950 text-zinc-50 shadow-[0_24px_70px_-42px_rgba(0,0,0,0.95)] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-300">{dashboard.greeting}, {user.name}</p>
            <h2 className="mt-2 text-3xl font-black text-white">{yearProgress.day}/{yearProgress.total}</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-300">{dashboard.yearProgress}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 px-4 py-3 text-right">
            <p className="text-2xl font-black text-white">{yearProgress.percentage}%</p>
            <p className="text-xs font-bold text-zinc-400">{dashboard.yearComplete}</p>
          </div>
        </div>
        <div className="[&>div]:bg-white/10">
          <ProgressBar value={yearProgress.percentage} />
        </div>
      </Card>

      <SectionTitle title={dashboard.weeklyPlan} />
      <div className="grid gap-3">
        {weeklyPlan.length ? weeklyPlan.slice(0, 3).map((day) => (
          <Card key={day.day} className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-black">{day.day}</h3>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500 dark:bg-zinc-900">{day.blocks.length} {dashboard.blocks}</span>
            </div>
            <p className="text-sm font-semibold">{day.focus}</p>
            <p className="text-xs leading-5 text-zinc-500">{day.blocks.join(" · ")}</p>
          </Card>
        )) : (
          <EmptyState title={dashboard.emptyWeekTitle} description={dashboard.emptyWeekDescription} />
        )}
      </div>

      <Card>
        <h3 className="text-lg font-bold">{dashboard.weeklySummary}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-500">{dashboard.weeklyText}</p>
      </Card>

      <SectionTitle title={dashboard.overview} description={dashboard.overviewText} />

      <Card className="grid gap-3 border-white/10 bg-zinc-950/90 text-white shadow-[0_22px_60px_-36px_rgba(0,0,0,0.9)] dark:bg-white/[0.06]">
        <div>
          <h3 className="text-lg font-black">{dashboard.routineFeedback}</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-300">{dashboard.routineFeedbackText}</p>
        </div>
        <Button href="/feedback" variant="secondary">{dashboard.openFeedback}</Button>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button href="/routine">{dashboard.recalculate}</Button>
        <Button href="/checkin" variant="secondary">{dashboard.quickCheckin}</Button>
      </div>

      <SectionTitle title={dashboard.now} />
      {routineBlocks[0] ? (
        <RoutineCard block={routineBlocks[0]} />
      ) : (
        <EmptyState title={dashboard.emptyRoutineTitle} description={dashboard.emptyRoutineDescription} />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button href="/assistant" variant="secondary">{dashboard.assistantShortcut}</Button>
        <Button href="/habits" variant="secondary">{dashboard.habitsShortcut}</Button>
      </div>

      <SectionTitle title={dashboard.next} />
      {routineBlocks.slice(1, 4).map((block) => <RoutineCard key={block.id} block={block} />)}

      <SectionTitle title={dashboard.habits} />
      {habits.length ? (
        habits.slice(0, 2).map((habit) => <HabitCard key={habit.id} habit={habit} />)
      ) : (
        <EmptyState title={dashboard.emptyHabitsTitle} description={dashboard.emptyHabitsDescription} />
      )}
    </AppShell>
  );
}
