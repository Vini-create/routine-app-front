"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "./LanguageProvider";
import { SectionTitle } from "./SectionTitle";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { weekRange } from "@/lib/date";
import { routineApi } from "@/lib/routineApi";

export function InsightsOverview() {
  const labels = useTranslations("insightsPage");
  const range = weekRange();
  const habits = useQuery({
    queryKey: ["habits-dashboard", range.start, range.end],
    queryFn: () => routineApi.habitsDashboard(range.start, range.end),
  });
  const goals = useQuery({
    queryKey: ["goals-dashboard", "week", range.start, range.end],
    queryFn: () => routineApi.goalsDashboard(range.end, range.start),
  });
  const habitItems = habits.data?.habits ?? [];
  const goalItems = goals.data?.goals ?? [];
  const completion = habitItems.length
    ? Math.round(habitItems.reduce((sum, item) => sum + item.consistency_percent, 0) / habitItems.length)
    : 0;

  return (
    <section id="insights" className="grid scroll-mt-24 gap-5">
      <SectionTitle title={labels.title} description={labels.patternsDescription} />
      <Card className="grid overflow-hidden p-0 lg:grid-cols-[minmax(250px,0.32fr)_minmax(0,1fr)]">
        <div data-tour="insights-summary" className="grid content-center gap-5 border-b border-[var(--border-soft)] p-6 lg:border-b-0 lg:border-r lg:p-8">
          <div>
            <p className="label-micro">{labels.completion}</p>
            <p className="mt-4 font-display text-7xl font-light leading-none text-[var(--text-primary)]">{completion}%</p>
          </div>
          <ProgressBar value={completion} />
        </div>

        <div className="grid content-start gap-5 p-6 lg:p-8">
          <h3 className="font-display text-2xl font-light uppercase leading-none text-[var(--text-primary)] sm:text-3xl">
            {labels.patterns}
          </h3>
          <div data-tour="insights-patterns" className="grid gap-3 sm:grid-cols-2">
            {goalItems.slice(0, 4).map((item) => (
              <div key={item.goal.id} className="grid gap-3 rounded-[1.35rem] border border-[var(--border-soft)] bg-[var(--surface-ambient)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{item.goal.title}</h3>
                  <Badge tone={item.consistency_level === "fire" ? "green" : item.consistency_level === "grass" ? "blue" : item.consistency_level === "ice" ? "amber" : "neutral"}>
                    {Math.round(item.consistency_percent)}%
                  </Badge>
                </div>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {item.completed_count} {labels.completed} · {item.uncompleted_count} {labels.uncompleted} · {item.pending_count} {labels.pending}
                </p>
              </div>
            ))}
            {!goals.isLoading && !goalItems.length ? (
              <div className="sm:col-span-2">
                <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} href="/goals" />
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </section>
  );
}
