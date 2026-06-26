"use client";

import { FormEvent, useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { useTranslations } from "@/components/app/LanguageProvider";
import { SectionTitle } from "@/components/app/SectionTitle";
import { useAppData } from "@/components/app/useAppData";
import { useStoredHabits } from "@/components/app/useStoredHabits";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Textarea } from "@/components/ui/Form";
import { generateRoutineFeedback } from "@/lib/routineFeedbackApi";

export default function FeedbackPage() {
  const feedbackLabels = useTranslations("feedback");
  const { habits, routineBlocks, user, weeklyPlan } = useAppData();
  const { storedHabits } = useStoredHabits();
  const [goal, setGoal] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  const allHabits = useMemo(() => [...habits, ...storedHabits], [habits, storedHabits]);
  const totalWeeklyBlocks = weeklyPlan.reduce((total, day) => total + day.blocks.length, 0);
  const busiestDay = weeklyPlan.reduce<typeof weeklyPlan[number] | null>((current, day) => (!current || day.blocks.length > current.blocks.length ? day : current), null);
  const lightestDay = weeklyPlan.reduce<typeof weeklyPlan[number] | null>((current, day) => (!current || day.blocks.length < current.blocks.length ? day : current), null);

  const weeklyRoutine = useMemo(() => ({
    blocks: routineBlocks,
    habits: allHabits,
    profile: {
      occupation: user.occupation,
      wakeTime: user.wakeTime,
      sleepTime: user.sleepTime,
    },
    week: weeklyPlan,
  }), [allHabits, routineBlocks, user.occupation, user.sleepTime, user.wakeTime, weeklyPlan]);

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
    <AppShell title={feedbackLabels.title}>
      <Card className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
        <SectionTitle title={feedbackLabels.title} description={feedbackLabels.subtitle} />
      </Card>

      <Card>
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

      <Card className="grid gap-4">
        <SectionTitle title={feedbackLabels.weekSummaryTitle} description={feedbackLabels.weekSummaryDescription} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
            <p className="text-2xl font-black">{totalWeeklyBlocks}</p>
            <p className="text-xs font-semibold text-zinc-500">{feedbackLabels.weekBlocks}</p>
          </div>
          <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
            <p className="text-2xl font-black">{allHabits.length}</p>
            <p className="text-xs font-semibold text-zinc-500">{feedbackLabels.mainHabits}</p>
          </div>
          <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
            <p className="text-lg font-black">{busiestDay?.day ?? "—"}</p>
            <p className="text-xs font-semibold text-zinc-500">{feedbackLabels.busiestDay}</p>
          </div>
          <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
            <p className="text-lg font-black">{lightestDay?.day ?? "—"}</p>
            <p className="text-xs font-semibold text-zinc-500">{feedbackLabels.lightestDay}</p>
          </div>
        </div>
        <div className="grid gap-2">
          {weeklyPlan.length ? weeklyPlan.slice(0, 4).map((day) => (
            <div key={day.day} className="rounded-2xl border border-zinc-100 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
              <p className="text-sm font-black">{day.day} · {day.focus}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">{day.blocks.join(" · ")}</p>
            </div>
          )) : (
            <p className="rounded-2xl border border-zinc-100 bg-white/70 p-4 text-sm leading-6 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/70">
              {feedbackLabels.emptyRoutineContext}
            </p>
          )}
        </div>
        <p className="text-xs leading-5 text-zinc-500">
          {feedbackLabels.sleepContext} {user.wakeTime || "—"} / {user.sleepTime || "—"}
        </p>
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
