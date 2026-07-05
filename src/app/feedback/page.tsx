"use client";

import { FormEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { useAuth } from "@/components/app/AuthProvider";
import { DevelopmentNotice } from "@/components/app/DevelopmentNotice";
import { useTranslations } from "@/components/app/LanguageProvider";
import { SectionTitle } from "@/components/app/SectionTitle";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Textarea } from "@/components/ui/Form";
import { generateRoutineFeedback } from "@/lib/routineFeedbackApi";
import { agendaEntries } from "@/lib/agenda";
import { addDays, fromDateKey, toDateKey, weekRange } from "@/lib/date";
import { routineApi } from "@/lib/routineApi";

export default function FeedbackPage() {
  const feedbackLabels = useTranslations("feedback");
  const { user } = useAuth();
  const range = weekRange();
  const agendaQuery = useQuery({ queryKey: ["agenda", range.start, range.end], queryFn: () => routineApi.agenda(range.start, range.end) });
  const habitsQuery = useQuery({ queryKey: ["habits-dashboard", range.start, range.end], queryFn: () => routineApi.habitsDashboard(range.start, range.end) });
  const [goal, setGoal] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  const routineBlocks = useMemo(() => agendaEntries(agendaQuery.data), [agendaQuery.data]);
  const allHabits = useMemo(() => habitsQuery.data?.habits.map((item) => item.habit) ?? [], [habitsQuery.data]);
  const weeklyPlan = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = addDays(fromDateKey(range.start), index);
    const key = toDateKey(date);
    const dayEntries = routineBlocks.filter((entry) => entry.date === key);
    return { day: date.toLocaleDateString(undefined, { weekday: "long" }), focus: dayEntries[0]?.title ?? "—", blocks: dayEntries.map((entry) => entry.title), habits: dayEntries.filter((entry) => entry.source === "habit").map((entry) => entry.title) };
  }), [range.start, routineBlocks]);
  const weeklyRoutine = useMemo(() => ({
    blocks: routineBlocks,
    habits: allHabits,
    profile: {
      displayName: user?.display_name,
      email: user?.email,
    },
    week: weeklyPlan,
  }), [allHabits, routineBlocks, user?.display_name, user?.email, weeklyPlan]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!goal.trim()) {
      setValidationMessage(feedbackLabels.goalRequired);
      return;
    }

    setValidationMessage("");
    setError("");
    setFeedback("");
    setIsLoading(true);

    try {
      const response = await generateRoutineFeedback({
        goal: goal.trim(),
        weeklyRoutine,
      }, feedbackLabels.fallbackFeedback);

      setFeedback(response.feedback);
    } catch {
      setError(feedbackLabels.error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppShell title={feedbackLabels.title} infoPage="feedback">
      <Card className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
        <SectionTitle title={feedbackLabels.title} description={feedbackLabels.subtitle} />
      </Card>

      <DevelopmentNotice
        label={feedbackLabels.developmentLabel}
        description={feedbackLabels.developmentDescription}
        footnote={feedbackLabels.developmentFootnote}
      />

      <Card data-tour="feedback-form">
        <form onSubmit={onSubmit} className="grid gap-4">
          <FieldLabel label={feedbackLabels.goalLabel}>
            <Textarea
              value={goal}
              onChange={(event) => {
                setGoal(event.target.value);
                if (event.target.value.trim()) setValidationMessage("");
              }}
              placeholder={feedbackLabels.goalPlaceholder}
              className="min-h-36"
              required
            />
          </FieldLabel>
          <p className="text-xs leading-5 text-zinc-500">{feedbackLabels.privacyNote}</p>
          {validationMessage ? <p className="text-sm font-semibold text-[var(--text-primary)]">{validationMessage}</p> : null}
          <Button type="submit" disabled={!goal.trim() || isLoading}>
            {isLoading ? feedbackLabels.loading : feedbackLabels.generate}
          </Button>
        </form>
      </Card>

      {error ? (
        <Card className="border-[var(--border-medium)] bg-[var(--surface-standard)] text-[var(--text-primary)]">
          <p className="text-sm font-semibold">{error}</p>
        </Card>
      ) : null}

      {feedback ? (
        <Card className="glass-focus">
          <h2 className="font-display text-3xl font-light uppercase leading-none text-[var(--text-primary)]">{feedbackLabels.analysisTitle}</h2>
          <div className="mt-4 grid gap-3 text-sm leading-6 text-[var(--text-secondary)]">
            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-ambient)] p-4">
              <p className="label-micro">{feedbackLabels.strengths}</p>
              <p className="mt-2">{feedback}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-ambient)] p-4">
                <p className="label-micro">{feedbackLabels.attention}</p>
                <p className="mt-2">{feedbackLabels.attentionText}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-ambient)] p-4">
                <p className="label-micro">{feedbackLabels.practicalSuggestion}</p>
                <p className="mt-2">{feedbackLabels.practicalText}</p>
              </div>
            </div>
          </div>
        </Card>
      ) : null}
    </AppShell>
  );
}
