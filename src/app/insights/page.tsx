"use client";

import { AppShell } from "@/components/app/AppShell";
import { useTranslations } from "@/components/app/LanguageProvider";
import { SectionTitle } from "@/components/app/SectionTitle";
import { useAppData } from "@/components/app/useAppData";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function InsightsPage() {
  const labels = useTranslations("insightsPage");
  const { insights } = useAppData();
  const completion = 0;

  return (
    <AppShell title={labels.title}>
      <Card className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
        <p className="text-sm opacity-70">{labels.completion}</p>
        <h2 className="mt-2 text-5xl font-black">{completion}%</h2>
        <div className="mt-5"><ProgressBar value={completion} /></div>
      </Card>
      <SectionTitle title={labels.patterns} description={labels.patternsDescription} />
      <div className="grid gap-4">
        {insights.length ? insights.map((insight) => (
          <Card key={insight.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">{insight.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{insight.description}</p>
              </div>
              <Badge tone={insight.trend === "up" ? "green" : insight.trend === "down" ? "amber" : "blue"}>
                {insight.metric}
              </Badge>
            </div>
          </Card>
        )) : (
          <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} href="/checkin" />
        )}
      </div>
    </AppShell>
  );
}
