"use client";

import Link from "next/link";
import { BrandMark } from "@/components/app/BrandMark";
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
    <main className="alfredPage min-h-dvh">
      <nav className="glass-ambient sticky top-0 z-30 border-b backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" aria-label="Winperium home">
          <BrandMark />
        </Link>
        <Button href="/login" variant="secondary" className="min-h-10 px-4">
          {landing.login}
        </Button>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-12 pt-10 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div className="grid gap-6">
          <Badge tone="green" className="w-fit">Alfred AI coach for ambitious minds</Badge>
          <h1 className="display-title max-w-3xl text-6xl text-[var(--text-primary)] md:text-8xl">
            Winperium organiza sua disciplina para dias reais.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-[var(--text-secondary)]">
            {landing.subtitle}
          </p>
          <div className="grid gap-3 sm:flex">
            <Button href="/register" className="w-full sm:w-auto">{landing.startNow}</Button>
            <Button href="/dashboard" variant="secondary" className="w-full sm:w-auto">{landing.viewDemo}</Button>
          </div>
        </div>
        <Card className="grid gap-4 p-4">
          <div className="glass-focus rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{landing.heroScore}</p>
              <BrandMark showWordmark={false} iconClassName="size-8 text-[var(--text-primary)]" />
            </div>
            <h2 className="font-display mt-2 text-4xl font-light uppercase leading-none">{landing.heroTitle}</h2>
          </div>
          {landingRoutineExamples.map((block) => (
            <div key={block.id} className="flex items-center justify-between rounded-xl border border-[var(--border-soft)] bg-[var(--surface-ambient)] p-4">
              <div>
                <p className="text-xs font-bold text-[var(--text-tertiary)]">{block.time}</p>
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
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{landing.howStepDescription}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-10">
        <SectionTitle title={landing.benefitsTitle} />
        <div className="grid gap-3 md:grid-cols-2">
          {landing.benefits.map((benefit) => (
            <Card key={benefit} className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl border border-[var(--border-medium)] bg-[var(--surface-ambient)] font-bold text-[var(--text-primary)]">✓</span>
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
              <div key={block.id} className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-ambient)] p-4">
                <p className="text-sm font-bold text-[var(--text-tertiary)]">{block.time} · {block.energy}</p>
                <p className="font-semibold">{block.title}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="glass-focus">
          <SectionTitle title={landing.aiTitle} description={landing.aiDescription} />
          <p className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-ambient)] p-5 text-sm leading-7 text-[var(--text-secondary)]">
            {landing.aiQuote}
          </p>
        </Card>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-10">
        <SectionTitle title={landing.plansTitle} description={landing.plansDescription} />
        <div className="grid gap-4 md:grid-cols-3">
          {["Starter", "Pro", "Max"].map((plan, index) => (
            <Card key={plan} className={index === 1 ? "border-[var(--border-strong)]" : ""}>
              <h3 className="text-xl font-bold">{plan}</h3>
              <p className="mt-2 font-display text-5xl font-light leading-none text-[var(--text-primary)]">$ {index === 0 ? "9" : index === 1 ? "19" : "39"}</p>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">{landing.planDescription}</p>
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
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{landing.faqAnswer}</p>
          </Card>
        ))}
      </section>

      <footer className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-10 text-sm text-[var(--text-secondary)]">
        <BrandMark iconClassName="size-8" />
        <span>{landing.footer}</span>
      </footer>
    </main>
  );
}
