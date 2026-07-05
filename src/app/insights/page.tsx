"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { useTranslations } from "@/components/app/LanguageProvider";
import { SectionTitle } from "@/components/app/SectionTitle";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { monthRange, toDateKey } from "@/lib/date";
import { routineApi } from "@/lib/routineApi";

export default function InsightsPage() {
  const labels = useTranslations("insightsPage"); const range = { ...monthRange(), end: toDateKey(new Date()) };
  const habits = useQuery({ queryKey:["habits-dashboard",range.start,range.end],queryFn:()=>routineApi.habitsDashboard(range.start,range.end) });
  const goals = useQuery({ queryKey:["goals-dashboard","month",range.start,range.end],queryFn:()=>routineApi.goalsDashboard(range.end,range.start) });
  const habitItems=habits.data?.habits??[]; const goalItems=goals.data?.goals??[];
  const completion=habitItems.length?Math.round(habitItems.reduce((sum,item)=>sum+item.consistency_percent,0)/habitItems.length):0;
  return <AppShell title={labels.title} infoPage="insights"><Card className="grid gap-4"><p className="text-sm text-[var(--text-secondary)]">{labels.completion}</p><h2 className="text-5xl font-black">{completion}%</h2><ProgressBar value={completion} /></Card><SectionTitle title={labels.patterns} description={labels.patternsDescription} /><div className="grid gap-4">{goalItems.map((item)=><Card key={item.goal.id}><div className="flex justify-between gap-4"><div><h3 className="text-lg font-bold">{item.goal.title}</h3><p className="mt-2 text-sm text-[var(--text-secondary)]">{item.completed_count} concluídos · {item.uncompleted_count} não concluídos · {item.pending_count} pendentes</p></div><Badge tone={item.consistency_level==="fire"?"green":item.consistency_level==="grass"?"blue":item.consistency_level==="ice"?"amber":"neutral"}>{Math.round(item.consistency_percent)}%</Badge></div></Card>)}{!goals.isLoading&&!goalItems.length?<EmptyState title={labels.emptyTitle} description={labels.emptyDescription} href="/goals" />:null}</div></AppShell>;
}
