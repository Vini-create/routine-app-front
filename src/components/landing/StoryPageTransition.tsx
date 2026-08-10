"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function StoryPageTransition({ children }: { children: ReactNode }) {
  const transitionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const root = transitionRef.current;
    const panel = root?.querySelector<HTMLElement>("[data-transition-panel]");
    if (!root || !panel) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(panel, { clearProps: "all" });
      return;
    }

    gsap.fromTo(panel, {
      borderRadius: "2.75rem 2.75rem 0 0",
      scaleX: 0.97,
      yPercent: 8,
    }, {
      borderRadius: "0rem 0rem 0 0",
      scaleX: 1,
      yPercent: 0,
      ease: "none",
      scrollTrigger: {
        trigger: root,
        start: "top bottom",
        end: "top top",
        scrub: 0.55,
        invalidateOnRefresh: true,
      },
    });
  }, { scope: transitionRef });

  return (
    <div ref={transitionRef} className="storyToProductTransition">
      <div className="storyTransitionPage" data-transition-panel>
        {children}
      </div>
    </div>
  );
}
