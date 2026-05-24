"use client";

import { useTranslations } from "@/components/app/LanguageProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/Form";

export default function OnboardingPage() {
  const onboarding = useTranslations("onboarding");

  return (
    <main className="min-h-dvh bg-[#f7f4ee] px-5 py-6 text-zinc-950 dark:bg-[#080807] dark:text-zinc-50">
      <div className="mx-auto grid max-w-3xl gap-5">
        <div>
          <Badge tone="green">{onboarding.badge}</Badge>
          <h1 className="mt-3 text-4xl font-black tracking-tight">{onboarding.title}</h1>
        </div>
        <Card className="grid gap-4">
          <h2 className="text-xl font-bold">{onboarding.personal}</h2>
          <FieldLabel label={onboarding.name}><Input placeholder={onboarding.namePlaceholder} /></FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label={onboarding.age}><Input type="number" placeholder="28" /></FieldLabel>
            <FieldLabel label={onboarding.occupation}><Input placeholder={onboarding.occupationPlaceholder} /></FieldLabel>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label={onboarding.wake}><Input type="time" /></FieldLabel>
            <FieldLabel label={onboarding.sleep}><Input type="time" /></FieldLabel>
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-bold">{onboarding.goalsTitle}</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {onboarding.goals.map((goal) => (
              <label key={goal} className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3 text-sm font-semibold dark:bg-zinc-900">
                <input type="checkbox" /> {goal}
              </label>
            ))}
          </div>
        </Card>
        <Card className="grid gap-4">
          <h2 className="text-xl font-bold">{onboarding.currentRoutine}</h2>
          <FieldLabel label={onboarding.fixedHours}><Textarea placeholder={onboarding.fixedHoursPlaceholder} /></FieldLabel>
          <FieldLabel label={onboarding.recurring}><Textarea placeholder={onboarding.recurringPlaceholder} /></FieldLabel>
          <FieldLabel label={onboarding.freeTime}><Input placeholder={onboarding.freeTimePlaceholder} /></FieldLabel>
          <FieldLabel label={onboarding.difficulty}><Textarea /></FieldLabel>
          <FieldLabel label={onboarding.distraction}><Input placeholder={onboarding.distractionPlaceholder} /></FieldLabel>
        </Card>
        <Card className="grid gap-4">
          <h2 className="text-xl font-bold">{onboarding.preferences}</h2>
          <FieldLabel label={onboarding.routineStyle}><Select><option>{onboarding.flexible}</option><option>{onboarding.strict}</option><option>{onboarding.hybrid}</option></Select></FieldLabel>
          <div className="grid gap-3 sm:grid-cols-3">
            <FieldLabel label={onboarding.morningEnergy}><Input type="range" min="1" max="10" /></FieldLabel>
            <FieldLabel label={onboarding.afternoonEnergy}><Input type="range" min="1" max="10" /></FieldLabel>
            <FieldLabel label={onboarding.nightEnergy}><Input type="range" min="1" max="10" /></FieldLabel>
          </div>
          <FieldLabel label={onboarding.intensity}><Select><option>{onboarding.light}</option><option>{onboarding.moderate}</option><option>{onboarding.high}</option></Select></FieldLabel>
          <FieldLabel label={onboarding.tone}><Select><option>{onboarding.gentle}</option><option>{onboarding.neutral}</option><option>{onboarding.direct}</option></Select></FieldLabel>
        </Card>
        <Card className="grid gap-4">
          <h2 className="text-xl font-bold">{onboarding.summary}</h2>
          <p className="text-sm leading-6 text-zinc-500">{onboarding.summaryText}</p>
          <Button href="/dashboard">{onboarding.generate}</Button>
        </Card>
      </div>
    </main>
  );
}
