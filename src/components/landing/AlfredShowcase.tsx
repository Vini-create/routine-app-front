"use client";

import Image from "next/image";
import alfredAvatar from "../../../alfred.png";
import { useTranslations } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { AppScreenPreview } from "./AppScreenPreview";

export function AlfredShowcase() {
  const landing = useTranslations("landing");

  return (
    <section id="alfred" className="alfredLandingSection winLandingSection">
      <div className="alfredLandingAtmosphere" aria-hidden="true" />
      <div className="alfredLandingCopy">
        <div className="alfredLandingIdentity">
          <Image src={alfredAvatar} alt="" className="size-12 rounded-2xl object-cover" sizes="48px" />
          <div>
            <p className="text-body">{landing.alfredLabel}</p>
            <strong className="text-logo">Alfred</strong>
          </div>
        </div>
        <h2 className="featureTitle text-display">{landing.alfredFeatureTitle}</h2>
        <p className="featureDescription text-display-medium">{landing.alfredFeatureDescription}</p>
        <Button href="/assistant" variant="secondary" className="mt-8 w-fit">{landing.meetAlfred}</Button>
      </div>
      <AppScreenPreview route="/assistant" title={landing.alfredPreviewLabel} />
    </section>
  );
}
