"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import type { StoryStepConfig } from "./storyConfig";

gsap.registerPlugin(useGSAP, SplitText);

export function SilverHighlight({ children }: { children: ReactNode }) {
  return <span className="text-silver">{children}</span>;
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
  const splitCharsRef = useRef<HTMLElement[]>([]);

  useGSAP(() => {
    if (index === 0 || !articleRef.current) return;

    const targets = articleRef.current.querySelectorAll<HTMLElement>("[data-story-split]");
    const splits = Array.from(targets, (target) => SplitText.create(target, {
      type: "words,chars",
      charsClass: "storySplitChar",
      wordsClass: "storySplitWord",
      aria: "auto",
    }));
    const chars = splits.flatMap((split) => split.chars) as HTMLElement[];
    splitCharsRef.current = chars;

    gsap.set(chars, {
      autoAlpha: 0,
      yPercent: 72,
    });

    return () => {
      splitCharsRef.current = [];
      splits.forEach((split) => split.revert());
    };
  }, { scope: articleRef, dependencies: [eyebrow, index, support, title], revertOnUpdate: true });

  useGSAP(() => {
    if (index === 0 || splitCharsRef.current.length === 0) return;
    const chars = splitCharsRef.current;
    gsap.killTweensOf(chars);

    if (active) {
      gsap.to(chars, {
        autoAlpha: 1,
        yPercent: 0,
        duration: 0.88,
        ease: "power4.out",
        stagger: { each: 0.034, from: "start" },
        overwrite: true,
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
      <TitleTag className="story-title text-display" data-story-split>{title}</TitleTag>
      {support ? <p className="storySupport text-display-medium" data-story-split>{support}</p> : null}
    </article>
  );
}
