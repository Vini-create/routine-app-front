"use client";

import { useTranslations } from "@/components/app/LanguageProvider";
import { AppScreenPreview } from "./AppScreenPreview";

const featureRoutes = ["/routine", "/habits", "/goals", "/feedback"] as const;

export function FeatureShowcase() {
  const landing = useTranslations("landing");

  return (
    <section id="recursos" className="featureShowcase">
      {landing.productFeatures.map((feature, index) => (
        <article className="featureSection winLandingSection" data-reverse={index % 2 === 1} key={feature.label}>
          <div className="featureCopy">
            <p className="featureIndex text-body">0{index + 1} / {feature.label}</p>
            <h2 className="featureTitle text-display">{feature.title}</h2>
            <p className="featureDescription text-display-medium">{feature.description}</p>
            <a className="featureLink text-body" href={featureRoutes[index]}>
              {landing.exploreFeature} <span aria-hidden="true">↗</span>
            </a>
          </div>
          <AppScreenPreview route={featureRoutes[index]} title={feature.previewLabel} />
        </article>
      ))}
    </section>
  );
}
