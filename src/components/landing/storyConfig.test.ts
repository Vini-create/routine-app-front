import { describe, expect, it } from "vitest";
import {
  climbToTimelapseScroll,
  getActiveStoryStep,
  getClimbToTimelapseFade,
  landingVideoDuration,
  mapScrollToVideoTime,
  storySteps,
} from "./storyConfig";

describe("mountain landing story timeline", () => {
  it("maps the scroll endpoints to the complete video", () => {
    expect(mapScrollToVideoTime(-1)).toBe(0);
    expect(mapScrollToVideoTime(0)).toBe(0);
    expect(mapScrollToVideoTime(1)).toBe(landingVideoDuration);
    expect(mapScrollToVideoTime(2)).toBe(landingVideoDuration);
  });

  it("aligns every story beat with its configured video boundary", () => {
    for (const step of storySteps) {
      expect(mapScrollToVideoTime(step.scrollStart)).toBeCloseTo(step.videoStart, 5);
    }
  });

  it("activates each beat and leaves the final summit frame unobstructed", () => {
    for (const step of storySteps) {
      const midpoint = (step.scrollStart + step.scrollEnd) / 2;
      expect(getActiveStoryStep(midpoint)).toBe(step.id);
    }

    expect(getActiveStoryStep(0.98)).toBeNull();
  });

  it("gives the day-cycle timelapse substantially more scroll than adjacent beats", () => {
    const timelapse = storySteps.find((step) => step.id === "consistency");
    const climb = storySteps.find((step) => step.id === "resilience");

    expect(timelapse).toBeDefined();
    expect(climb).toBeDefined();
    expect(timelapse!.scrollEnd - timelapse!.scrollStart).toBeGreaterThan(
      (climb!.scrollEnd - climb!.scrollStart) * 2,
    );
  });

  it("hides the hard climbing-to-timelapse cut behind a smooth fade", () => {
    expect(getClimbToTimelapseFade(climbToTimelapseScroll)).toBe(1);
    expect(getClimbToTimelapseFade(climbToTimelapseScroll - 0.007)).toBeCloseTo(0.5, 5);
    expect(getClimbToTimelapseFade(climbToTimelapseScroll + 0.007)).toBeCloseTo(0.5, 5);
    expect(getClimbToTimelapseFade(climbToTimelapseScroll - 0.02)).toBe(0);
    expect(getClimbToTimelapseFade(climbToTimelapseScroll + 0.02)).toBe(0);
  });
});
