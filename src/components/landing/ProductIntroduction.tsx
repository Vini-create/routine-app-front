"use client";

import { useTranslations } from "@/components/app/LanguageProvider";
import { SilverHighlight } from "./StoryTextStep";

export function ProductIntroduction() {
  const landing = useTranslations("landing");

  return (
    <section id="produto" className="productIntroduction winLandingSection">
      <div className="productIntroductionLine" aria-hidden="true" />
      <p className="productIntroductionEyebrow text-body">{landing.productIntroductionEyebrow}</p>
      <h2 className="productIntroductionTitle text-editorial">
        {landing.productIntroductionLead} <SilverHighlight>Winperium.</SilverHighlight>
      </h2>
      <p className="productIntroductionSubtitle text-display-medium">{landing.productIntroductionSubtitle}</p>
      <div className="productIntroductionCommitment text-editorial">
        <p>{landing.productIntroductionSupportLead}</p>
        <p>{landing.productIntroductionSupportEnd}</p>
      </div>
    </section>
  );
}
