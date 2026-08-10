"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage, useTranslations } from "@/components/app/LanguageProvider";
import { AppScreenPreview } from "./AppScreenPreview";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const featureRoutes = ["/routine", "/habits", "/goals", "/alfred"] as const;

export function FeatureShowcase() {
  const landing = useTranslations("landing");
  const { language } = useLanguage();
  const showcaseRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const root = showcaseRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.utils.toArray<HTMLElement>(".featureSection", root).forEach((section, index) => {
      const copy = section.querySelectorAll<HTMLElement>(".featureCopy > *");
      const preview = section.querySelector<HTMLElement>(".appScreenPreview");
      const screenshot = section.querySelector<HTMLElement>(".appScreenScreenshot");
      const reflection = section.querySelector<HTMLElement>(".appScreenScreenshotReflection");
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 74%",
          toggleActions: "play none none reverse",
        },
      });

      timeline.fromTo(copy, { autoAlpha: 0, y: 42 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.09,
      });

      if (preview) {
        timeline.fromTo(preview, {
          autoAlpha: 0,
          rotateY: index % 2 === 0 ? 7 : -7,
          scale: 0.91,
          y: 90,
        }, {
          autoAlpha: 1,
          rotateY: 0,
          scale: 1,
          y: 0,
          duration: 1.25,
          ease: "power4.out",
        }, "-=0.62");
      }

      if (screenshot) {
        gsap.fromTo(screenshot, { scale: 1.035, yPercent: -1.5 }, {
          scale: 1.035,
          yPercent: 1.5,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.8 },
        });
      }

      if (reflection) {
        gsap.fromTo(reflection, { xPercent: -22 }, {
          xPercent: 22,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.1 },
        });
      }
    });
  }, { scope: showcaseRef, dependencies: [language], revertOnUpdate: true });

  return (
    <section ref={showcaseRef} id="recursos" className="featureShowcase">
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
