export type StoryStepId = "dreams" | "goals" | "path" | "resilience" | "consistency" | "organization";

export type StoryStepConfig = {
  id: StoryStepId;
  scrollStart: number;
  scrollEnd: number;
  videoStart: number;
  videoEnd: number;
  placement: "top-left" | "bottom-right" | "top-right" | "bottom-left" | "center-left";
  poster: string;
};

export const landingVideoDuration = 32.166667;
export const landingVideoInitialTime = 0.4;
export const climbToTimelapseScroll = 0.465;
const climbToTimelapseFadeRadius = 0.014;

export const storySteps: StoryStepConfig[] = [
  {
    id: "dreams",
    scrollStart: 0,
    scrollEnd: 0.09,
    videoStart: landingVideoInitialTime,
    videoEnd: 4.5,
    placement: "top-left",
    poster: "/images/landing-story-mountain.webp",
  },
  {
    id: "goals",
    scrollStart: 0.09,
    scrollEnd: 0.165,
    videoStart: 4.5,
    videoEnd: 8.041667,
    placement: "bottom-right",
    poster: "/images/landing-story-climber.webp",
  },
  {
    id: "path",
    scrollStart: 0.165,
    scrollEnd: 0.315,
    videoStart: 8.041667,
    videoEnd: 12,
    placement: "top-left",
    poster: "/images/landing-story-struggle.webp",
  },
  {
    id: "resilience",
    scrollStart: 0.315,
    scrollEnd: climbToTimelapseScroll,
    videoStart: 12,
    videoEnd: 16.083333,
    placement: "bottom-right",
    poster: "/images/landing-story-resilience.webp",
  },
  {
    id: "consistency",
    scrollStart: climbToTimelapseScroll,
    scrollEnd: 0.82,
    videoStart: 16.083333,
    videoEnd: 24.125,
    placement: "bottom-left",
    poster: "/images/landing-story-seasons.webp",
  },
  {
    id: "organization",
    scrollStart: 0.82,
    scrollEnd: 0.97,
    videoStart: 24.125,
    videoEnd: landingVideoDuration,
    placement: "center-left",
    poster: "/images/landing-story-summit.webp",
  },
];

// Each control point matches a visual beat in the four source clips: the
// mountain, the climber reveal, the difficult ascent, the passing days and
// the summit. Keeping these boundaries explicit makes copy changes safe.
export const videoTimeline = [
  { scroll: 0, time: landingVideoInitialTime },
  { scroll: 0.09, time: 4.5 },
  { scroll: 0.165, time: 8.041667 },
  { scroll: 0.315, time: 12 },
  { scroll: climbToTimelapseScroll, time: 16.083333 },
  { scroll: 0.82, time: 24.125 },
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

export function getClimbToTimelapseFade(progress: number) {
  const distance = Math.abs(progress - climbToTimelapseScroll);
  if (distance >= climbToTimelapseFadeRadius) return 0;

  const amount = 1 - (distance / climbToTimelapseFadeRadius);
  return amount * amount * (3 - (2 * amount));
}
