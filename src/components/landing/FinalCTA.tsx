"use client";

import { useTranslations } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";

export function FinalCTA() {
  const landing = useTranslations("landing");

  return (
    <section className="finalLandingCta winLandingSection">
      <div className="finalLandingHalo" aria-hidden="true" />
      <p className="finalLandingEyebrow text-body">Winperium</p>
      <h2 className="finalLandingTitle text-display">{landing.finalCtaTitle}</h2>
      <p className="finalLandingDescription text-display-medium">{landing.finalCtaDescription}</p>
      <div className="finalLandingActions">
        <Button href="/register" className="px-8">{landing.startNow}</Button>
        <Button href="/dashboard" variant="secondary" className="px-8">{landing.discoverApp}</Button>
      </div>
    </section>
  );
}
