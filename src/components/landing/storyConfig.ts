export type StoryStepId = "dreams" | "goals" | "path" | "consistency" | "organization";

export type StoryStepConfig = {
  id: StoryStepId;
  scrollStart: number;
  scrollEnd: number;
  videoStart: number;
  videoEnd: number;
  placement: "top-left" | "bottom-right" | "top-right" | "bottom-left" | "center-left";
  poster: string;
};

export const landingVideoDuration = 12.933;

export const storySteps: StoryStepConfig[] = [
  {
    id: "dreams",
    scrollStart: 0,
    scrollEnd: 0.18,
    videoStart: 0,
    videoEnd: 0.95,
    placement: "top-left",
    poster: "/images/landing-story-helmet.webp",
  },
  {
    id: "goals",
    scrollStart: 0.18,
    scrollEnd: 0.32,
    videoStart: 0.95,
    videoEnd: 1.95,
    placement: "bottom-right",
    poster: "/images/landing-story-rocket.webp",
  },
  {
    id: "path",
    scrollStart: 0.32,
    scrollEnd: 0.48,
    videoStart: 1.95,
    videoEnd: 2.95,
    placement: "top-right",
    poster: "/images/landing-story-blueprint.webp",
  },
  {
    id: "consistency",
    scrollStart: 0.48,
    scrollEnd: 0.69,
    videoStart: 2.95,
    videoEnd: 7.7,
    placement: "bottom-left",
    poster: "/images/landing-story-pieces.webp",
  },
  {
    id: "organization",
    scrollStart: 0.69,
    scrollEnd: 0.91,
    videoStart: 7.7,
    videoEnd: 10.55,
    placement: "center-left",
    poster: "/images/landing-story-assembly.webp",
  },
];

export const videoTimeline = [
  { scroll: 0, time: 0 },
  ...storySteps.map((step) => ({ scroll: step.scrollEnd, time: step.videoEnd })),
  { scroll: 1, time: landingVideoDuration },
];

export function mapScrollToVideoTime(progress: number) {
  const clamped = Math.min(1, Math.max(0, progress));
  const nextIndex = videoTimeline.findIndex((point) => point.scroll >= clamped);

  if (nextIndex <= 0) return videoTimeline[0].time;

  const previous = videoTimeline[nextIndex - 1];
  const next = videoTimeline[nextIndex];
  const segmentProgress = (clamped - previous.scroll) / (next.scroll - previous.scroll);

  return previous.time + (next.time - previous.time) * segmentProgress;
}

export function getActiveStoryStep(progress: number) {
  return storySteps.find((step) => progress >= step.scrollStart && progress < step.scrollEnd)?.id ?? null;
}
