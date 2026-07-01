import type { ReactNode } from "react";
import type { StoryStepConfig } from "./storyConfig";

export function SilverHighlight({ children }: { children: ReactNode }) {
  return <span className="text-silver">{children}</span>;
}

export function StoryTextStep({
  step,
  active,
  eyebrow,
  title,
  support,
}: {
  step: StoryStepConfig;
  active: boolean;
  eyebrow?: string;
  title: ReactNode;
  support?: ReactNode;
}) {
  const TitleTag = step.id === "dreams" ? "h1" : "h2";

  return (
    <article
      className={`storyTextStep storyTextStep--${step.placement}`}
      data-active={active}
      data-story-step={step.id}
    >
      {eyebrow ? <p className="storyEyebrow text-body">{eyebrow}</p> : null}
      <TitleTag className="story-title text-display">{title}</TitleTag>
      {support ? <p className="storySupport text-display-medium">{support}</p> : null}
    </article>
  );
}
