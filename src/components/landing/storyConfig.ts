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
    scrollEnd: 0.085,
    videoStart: 0,
    videoEnd: 1.12,
    placement: "top-left",
    poster: "/images/landing-story-helmet.webp",
  },
  {
    id: "goals",
    scrollStart: 0.085,
    scrollEnd: 0.263,
    videoStart: 1.12,
    videoEnd: 2.15,
    placement: "bottom-right",
    poster: "/images/landing-story-rocket.webp",
  },
  {
    id: "path",
    scrollStart: 0.263,
    scrollEnd: 0.422,
    videoStart: 2.15,
    videoEnd: 3.2,
    placement: "top-left",
    poster: "/images/landing-story-blueprint.webp",
  },
  {
    id: "consistency",
    scrollStart: 0.422,
    scrollEnd: 0.65,
    videoStart: 3.2,
    videoEnd: 7.7,
    placement: "bottom-left",
    poster: "/images/landing-story-pieces.webp",
  },
  {
    id: "organization",
    scrollStart: 0.65,
    scrollEnd: 0.87,
    videoStart: 7.7,
    videoEnd: 10.55,
    placement: "center-left",
    poster: "/images/landing-story-assembly.webp",
  },
];

// The first three scenes contain long still frames separated by short,
// visually rich transitions. These control points cross the still portions
// quickly and reserve most of the scroll gesture for the transformations.
export const videoTimeline = [
  { scroll: 0, time: 0 },
  { scroll: 0.019, time: 0.82 },
  { scroll: 0.099, time: 1.12 },
  { scroll: 0.183, time: 1.85 },
  { scroll: 0.263, time: 2.15 },
  { scroll: 0.335, time: 2.85 },
  { scroll: 0.415, time: 3.15 },
  { scroll: 0.422, time: 3.2 },
  { scroll: 0.65, time: 7.7 },
  { scroll: 0.87, time: 10.55 },
  { scroll: 1, time: landingVideoDuration },
] as const;

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
