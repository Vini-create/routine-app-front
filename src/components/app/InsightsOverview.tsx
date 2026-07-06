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
    <section id="insights" className="grid scroll-mt-24 gap-4">
      <h2 className="label-micro text-xs">{labels.title}</h2>
      <div className="grid gap-5 lg:grid-cols-[minmax(260px,0.38fr)_minmax(0,1fr)] lg:items-start">
        <Card data-tour="insights-summary" className="grid gap-4 p-6 lg:sticky lg:top-28 lg:p-7">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{labels.completion}</p>
            <p className="mt-2 font-display text-6xl font-light leading-none text-[var(--text-primary)]">{completion}%</p>
          </div>
          <ProgressBar value={completion} />
        </Card>

        <div className="grid gap-4">
          <SectionTitle title={labels.patterns} description={labels.patternsDescription} />
          <div data-tour="insights-patterns" className="grid gap-3 sm:grid-cols-2">
            {goalItems.slice(0, 4).map((item) => (
              <Card key={item.goal.id} className="grid gap-3 p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{item.goal.title}</h3>
                  <Badge tone={item.consistency_level === "fire" ? "green" : item.consistency_level === "grass" ? "blue" : item.consistency_level === "ice" ? "amber" : "neutral"}>
                    {Math.round(item.consistency_percent)}%
                  </Badge>
                </div>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {item.completed_count} {labels.completed} · {item.uncompleted_count} {labels.uncompleted} · {item.pending_count} {labels.pending}
                </p>
              </Card>
            ))}
            {!goals.isLoading && !goalItems.length ? (
              <div className="sm:col-span-2">
                <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} href="/goals" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
