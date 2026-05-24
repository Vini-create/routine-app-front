"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { AiSuggestionCard } from "@/components/app/AiSuggestionCard";
import { useTranslations } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/Form";
import { submitCheckIn } from "@/lib/checkinApi";

export default function CheckinPage() {
  const [submitted, setSubmitted] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const checkin = useTranslations("checkin");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // API_CONNECTION_POINT: this already calls the check-in client; replace the local fallback with the real API.
    const response = await submitCheckIn({
      energy: Number(formData.get("energy") ?? 7),
      mood: String(formData.get("mood") ?? checkin.calm),
      sleepQuality: Number(formData.get("sleepQuality") ?? 6),
      stress: Number(formData.get("stress") ?? 4),
      focus: Number(formData.get("focus") ?? 7),
      obstacle: String(formData.get("obstacle") ?? ""),
      importantEvent: String(formData.get("importantEvent") ?? ""),
    }, checkin.response);

    setAiResponse(response.aiResponse);
    setSubmitted(true);
  }

  return (
    <AppShell title={checkin.title}>
      <Card>
        <form onSubmit={onSubmit} className="grid gap-4">
          <FieldLabel label={checkin.energy}><Input name="energy" type="range" min="1" max="10" defaultValue="7" /></FieldLabel>
          <FieldLabel label={checkin.mood}><Select name="mood"><option>{checkin.calm}</option><option>{checkin.motivated}</option><option>{checkin.anxious}</option><option>{checkin.tired}</option></Select></FieldLabel>
          <FieldLabel label={checkin.sleep}><Input name="sleepQuality" type="range" min="1" max="10" defaultValue="6" /></FieldLabel>
          <FieldLabel label={checkin.stress}><Input name="stress" type="range" min="1" max="10" defaultValue="4" /></FieldLabel>
          <FieldLabel label={checkin.focus}><Input name="focus" type="range" min="1" max="10" defaultValue="7" /></FieldLabel>
          <FieldLabel label={checkin.obstacle}><Textarea name="obstacle" placeholder={checkin.obstaclePlaceholder} /></FieldLabel>
          <FieldLabel label={checkin.event}><Textarea name="importantEvent" placeholder={checkin.eventPlaceholder} /></FieldLabel>
          <Button type="submit">{checkin.submit}</Button>
        </form>
      </Card>
      {submitted ? (
        <AiSuggestionCard
          title={checkin.responseTitle}
          text={aiResponse}
        />
      ) : null}
    </AppShell>
  );
}
