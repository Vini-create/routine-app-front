"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import type { StoryStepConfig } from "./storyConfig";

gsap.registerPlugin(useGSAP, SplitText);

export function SilverHighlight({ children }: { children: ReactNode }) {
  return <span className="text-silver" data-story-split>{children}</span>;
}

export function StoryTextSegment({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={className} data-story-split>{children}</span>;
}

export function StoryTextStep({
  step,
  active,
  eyebrow,
  title,
  support,
  index,
  total,
}: {
  step: StoryStepConfig;
  active: boolean;
  eyebrow?: string;
  title: ReactNode;
  support?: ReactNode;
  index: number;
  total: number;
}) {
  const TitleTag = step.id === "dreams" ? "h1" : "h2";
  const articleRef = useRef<HTMLElement>(null);
  const splitGroupsRef = useRef<HTMLElement[][]>([]);

  useGSAP(() => {
    if (index === 0 || !articleRef.current) return;

    const targets = articleRef.current.querySelectorAll<HTMLElement>("[data-story-split]");
    const splits = Array.from(targets, (target) => SplitText.create(target, {
      type: "words,chars",
      charsClass: "storySplitChar",
      wordsClass: "storySplitWord",
      aria: "auto",
    }));
    const groups = splits.map((split) => split.chars as HTMLElement[]);
    const chars = groups.flat();
    splitGroupsRef.current = groups;

    gsap.set(chars, {
      autoAlpha: 0,
      yPercent: 72,
    });

    return () => {
      splitGroupsRef.current = [];
      splits.forEach((split) => split.revert());
    };
  }, { scope: articleRef, dependencies: [eyebrow, index, support, title], revertOnUpdate: true });

  useGSAP(() => {
    if (index === 0 || splitGroupsRef.current.length === 0) return;
    const groups = splitGroupsRef.current;
    const chars = groups.flat();
    gsap.killTweensOf(chars);

    if (active) {
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const timeline = gsap.timeline({
        defaults: { overwrite: true },
      });
      groups.forEach((group, groupIndex) => {
        timeline.to(group, {
          autoAlpha: 1,
          yPercent: 0,
          duration: mobile ? 0.68 : 0.88,
          ease: "power4.out",
          stagger: { each: mobile ? 0.022 : 0.034, from: "start" },
        }, groupIndex * (mobile ? 0.09 : 0.13));
      });
    } else {
      gsap.set(chars, { autoAlpha: 0, yPercent: 72 });
    }
  }, { scope: articleRef, dependencies: [active, index] });

  return (
    <article
      ref={articleRef}
      className={`storyTextStep storyTextStep--${step.placement}`}
      data-active={active}
      data-story-step={step.id}
    >
      <p className="storyChapter" aria-hidden="true">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <i />
        <span>{String(total).padStart(2, "0")}</span>
      </p>
      {eyebrow ? <p className="storyEyebrow text-body" data-story-split>{eyebrow}</p> : null}
      <TitleTag className="story-title text-display">{title}</TitleTag>
      {support ? <p className="storySupport text-display-medium">{support}</p> : null}
    </article>
  );
}
