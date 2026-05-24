"use client";

import Link from "next/link";
import { useTranslations } from "@/components/app/LanguageProvider";
import { SectionTitle } from "@/components/app/SectionTitle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const landingRoutineExamples = [
  { id: "focus", time: "09:00", title: "Deep focus", duration: "90 min", energy: "high" },
  { id: "health", time: "12:30", title: "Real break", duration: "45 min", energy: "medium" },
  { id: "review", time: "19:30", title: "Daily review", duration: "20 min", energy: "low" },
  { id: "sleep", time: "22:30", title: "Sleep routine", duration: "8 h", energy: "low" },
] as const;

export default function LandingPage() {
  const landing = useTranslations("landing");

  return (
    <main className="min-h-dvh bg-[#f7f4ee] text-zinc-950 dark:bg-[#080807] dark:text-zinc-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="text-lg font-black tracking-tight">
          Rotina AI
        </Link>
        <Button href="/login" variant="secondary" className="min-h-10 px-4">
          {landing.login}
        </Button>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-12 pt-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="grid gap-6">
          <Badge tone="green" className="w-fit">{landing.badge}</Badge>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">
            {landing.headline}
          </h1>
          <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            {landing.subtitle}
          </p>
          <div className="grid gap-3 sm:flex">
            <Button href="/register" className="w-full sm:w-auto">{landing.startNow}</Button>
            <Button href="/dashboard" variant="secondary" className="w-full sm:w-auto">{landing.viewDemo}</Button>
          </div>
        </div>
        <Card className="grid gap-4 p-4">
          <div className="rounded-3xl bg-zinc-950 p-5 text-white dark:bg-zinc-900">
            <p className="text-sm text-emerald-300">{landing.heroScore}</p>
            <h2 className="mt-2 text-2xl font-bold">{landing.heroTitle}</h2>
          </div>
          {landingRoutineExamples.map((block) => (
            <div key={block.id} className="flex items-center justify-between rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <div>
                <p className="text-xs font-bold text-zinc-500">{block.time}</p>
                <p className="font-semibold">{block.title}</p>
              </div>
              <Badge tone="blue">{block.duration}</Badge>
            </div>
          ))}
        </Card>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-10">
        <SectionTitle eyebrow={landing.howEyebrow} title={landing.howTitle} description={landing.howDescription} />
        <div className="grid gap-4 md:grid-cols-3">
          {landing.howSteps.map((item, index) => (
            <Card key={item}>
              <Badge tone="blue">{index + 1}</Badge>
              <h3 className="mt-4 text-xl font-bold">{item}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{landing.howStepDescription}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-10">
        <SectionTitle title={landing.benefitsTitle} />
        <div className="grid gap-3 md:grid-cols-2">
          {landing.benefits.map((benefit) => (
            <Card key={benefit} className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-2xl bg-emerald-100 font-bold text-emerald-800">✓</span>
              <p className="font-semibold">{benefit}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-10 md:grid-cols-2">
        <Card>
          <SectionTitle title={landing.examplesTitle} description={landing.examplesDescription} />
          <div className="mt-5 grid gap-3">
            {landingRoutineExamples.map((block) => (
              <div key={block.id} className="rounded-2xl border border-zinc-100 p-4 dark:border-zinc-800">
                <p className="text-sm font-bold text-zinc-500">{block.time} · {block.energy}</p>
                <p className="font-semibold">{block.title}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
          <SectionTitle title={landing.aiTitle} description={landing.aiDescription} />
          <p className="mt-8 rounded-3xl bg-white/10 p-5 text-sm leading-7 dark:bg-zinc-100">
            {landing.aiQuote}
          </p>
        </Card>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-10">
        <SectionTitle title={landing.plansTitle} description={landing.plansDescription} />
        <div className="grid gap-4 md:grid-cols-3">
          {["Starter", "Pro", "Max"].map((plan, index) => (
            <Card key={plan} className={index === 1 ? "border-zinc-950 dark:border-white" : ""}>
              <h3 className="text-xl font-bold">{plan}</h3>
              <p className="mt-2 text-3xl font-black">$ {index === 0 ? "9" : index === 1 ? "19" : "39"}</p>
              <p className="mt-3 text-sm text-zinc-500">{landing.planDescription}</p>
              <Button href="/register" className="mt-5 w-full" variant={index === 1 ? "primary" : "secondary"}>{landing.choosePlan}</Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-10">
        <SectionTitle title="FAQ" />
        {landing.faqQuestions.map((q) => (
          <Card key={q}>
            <h3 className="font-bold">{q}</h3>
            <p className="mt-2 text-sm text-zinc-500">{landing.faqAnswer}</p>
          </Card>
        ))}
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-10 text-sm text-zinc-500">
        {landing.footer}
      </footer>
    </main>
  );
}
