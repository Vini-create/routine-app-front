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
      <nav className="sticky top-0 z-30 border-b border-transparent bg-[#0B0B0D]/82 backdrop-blur [background:linear-gradient(#0B0B0Dd1,#0B0B0Ddd)_padding-box,linear-gradient(90deg,rgba(43,43,49,.8),rgba(216,176,140,.42),rgba(184,115,51,.34),rgba(43,43,49,.8))_border-box]">
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
          <h1 className="font-brand max-w-3xl text-5xl font-semibold leading-[1.05] tracking-normal text-[#F6F1E8] md:text-7xl">
            Winperium organiza sua disciplina para dias reais.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-[#B9B0A4]">
            {landing.subtitle}
          </p>
          <div className="grid gap-3 sm:flex">
            <Button href="/register" className="w-full sm:w-auto">{landing.startNow}</Button>
            <Button href="/dashboard" variant="secondary" className="w-full sm:w-auto">{landing.viewDemo}</Button>
          </div>
        </div>
        <Card className="grid gap-4 p-4">
          <div className="rounded-2xl border border-transparent bg-[linear-gradient(#0B0B0D,#0B0B0D)_padding-box,linear-gradient(135deg,rgba(216,176,140,.58),rgba(184,115,51,.28),rgba(246,241,232,.18))_border-box] p-5 text-[#F6F1E8] shadow-[inset_0_1px_0_rgba(246,241,232,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#D8B08C]">{landing.heroScore}</p>
              <BrandMark showWordmark={false} iconClassName="size-8 text-[#D8B08C]" />
            </div>
            <h2 className="font-brand mt-2 text-3xl font-semibold">{landing.heroTitle}</h2>
          </div>
          {landingRoutineExamples.map((block) => (
            <div key={block.id} className="flex items-center justify-between rounded-xl border border-[#2B2B31] bg-[#0B0B0D]/55 p-4">
              <div>
                <p className="text-xs font-bold text-[#8B847B]">{block.time}</p>
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
              <p className="mt-2 text-sm leading-6 text-[#8B847B]">{landing.howStepDescription}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-10">
        <SectionTitle title={landing.benefitsTitle} />
        <div className="grid gap-3 md:grid-cols-2">
          {landing.benefits.map((benefit) => (
            <Card key={benefit} className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl border border-[#B87333]/40 bg-[#B87333]/12 font-bold text-[#D8B08C]">✓</span>
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
              <div key={block.id} className="rounded-xl border border-[#2B2B31] bg-[#0B0B0D]/35 p-4">
                <p className="text-sm font-bold text-[#8B847B]">{block.time} · {block.energy}</p>
                <p className="font-semibold">{block.title}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="border-[#B87333]/40 bg-[#0B0B0D] text-[#F6F1E8]">
          <SectionTitle title={landing.aiTitle} description={landing.aiDescription} />
          <p className="mt-8 rounded-2xl border border-[#2B2B31] bg-[#F6F1E8]/6 p-5 text-sm leading-7 text-[#EDE6DA]">
            {landing.aiQuote}
          </p>
        </Card>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-10">
        <SectionTitle title={landing.plansTitle} description={landing.plansDescription} />
        <div className="grid gap-4 md:grid-cols-3">
          {["Starter", "Pro", "Max"].map((plan, index) => (
            <Card key={plan} className={index === 1 ? "border-[#B87333]" : ""}>
              <h3 className="text-xl font-bold">{plan}</h3>
              <p className="mt-2 text-3xl font-black text-[#F6F1E8]">$ {index === 0 ? "9" : index === 1 ? "19" : "39"}</p>
              <p className="mt-3 text-sm text-[#8B847B]">{landing.planDescription}</p>
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
            <p className="mt-2 text-sm text-[#8B847B]">{landing.faqAnswer}</p>
          </Card>
        ))}
      </section>

      <footer className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-10 text-sm text-[#8B847B]">
        <BrandMark iconClassName="size-8" />
        <span>{landing.footer}</span>
      </footer>
    </main>
  );
}
