"use client";

import { AppShell } from "@/components/app/AppShell";
import { useTranslations } from "@/components/app/LanguageProvider";
import { SectionTitle } from "@/components/app/SectionTitle";
import { useAppData } from "@/components/app/useAppData";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CalendarPage() {
  const calendar = useTranslations("calendarPage");
  const { weeklyPlan } = useAppData();

  return (
    <AppShell title={calendar.title}>
      <div className="flex items-center justify-between gap-4">
        <SectionTitle title={calendar.heading} description={calendar.description} />
        <Button href="/assistant" className="shrink-0">{calendar.reorganize}</Button>
      </div>
      <div className="grid gap-4">
        {weeklyPlan.length ? weeklyPlan.map((day) => (
          <Card key={day.day}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge tone="blue">{day.day} · {day.date}</Badge>
                <h3 className="mt-3 text-lg font-bold">{day.focus}</h3>
              </div>
              <Badge tone="green">{day.blocks.length} {calendar.blocks}</Badge>
            </div>
            <div className="mt-4 grid gap-2">
              {day.blocks.map((block) => (
                <div key={block} className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-semibold dark:bg-zinc-900">{block}</div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {day.habits.map((habit) => <Badge key={habit} tone="purple">{habit}</Badge>)}
            </div>
          </Card>
        )) : (
          <EmptyState title={calendar.emptyTitle} description={calendar.emptyDescription} href="/routine" />
        )}
      </div>
    </AppShell>
  );
}
