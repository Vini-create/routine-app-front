"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage, useTranslations } from "@/components/app/LanguageProvider";
import { SilverHighlight } from "./StoryTextStep";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ProductIntroduction() {
  const landing = useTranslations("landing");
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const reveal = gsap.utils.toArray<HTMLElement>("[data-product-reveal]", sectionRef.current);
    gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 72%",
        toggleActions: "play none none reverse",
      },
    })
      .fromTo(".productIntroductionLine", { scaleY: 0, transformOrigin: "top" }, { scaleY: 1, duration: 0.9, ease: "power3.out" })
      .fromTo(reveal, { autoAlpha: 0, y: 46 }, {
        autoAlpha: 1,
        y: 0,
        duration: 1.05,
        ease: "power3.out",
        stagger: 0.12,
      }, "-=0.55");
  }, { scope: sectionRef, dependencies: [language], revertOnUpdate: true });

  return (
    <section ref={sectionRef} id="produto" className="productIntroduction winLandingSection">
      <div className="productIntroductionLine" aria-hidden="true" />
      <p className="productIntroductionEyebrow text-body" data-product-reveal>{landing.productIntroductionEyebrow}</p>
      <h2 className="productIntroductionTitle text-editorial" data-product-reveal>
        {landing.productIntroductionLead} <SilverHighlight>Winperium.</SilverHighlight>
      </h2>
      <p className="productIntroductionSubtitle text-display-medium" data-product-reveal>{landing.productIntroductionSubtitle}</p>
      <div className="productIntroductionCommitment text-editorial" data-product-reveal>
        <p>{landing.productIntroductionSupportLead}</p>
        <p>{landing.productIntroductionSupportEnd}</p>
      </div>
    </section>
  );
}
