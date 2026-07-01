"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import { getActiveStoryStep, mapScrollToVideoTime, type StoryStepId } from "./storyConfig";

export function useScrollVideo({
  containerRef,
  videoRef,
  disabled,
  onActiveStep,
}: {
  containerRef: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  disabled: boolean;
  onActiveStep: (step: StoryStepId | null) => void;
}) {
  const targetTimeRef = useRef(0);
  const renderedTimeRef = useRef(0);
  const activeStepRef = useRef<StoryStepId | null>(null);

  useEffect(() => {
    if (disabled) return;

    let measureFrame = 0;
    let playbackFrame = 0;
    let lastSeek = 0;
    let cancelled = false;

    function measure() {
      measureFrame = 0;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      targetTimeRef.current = mapScrollToVideoTime(progress);
      container.style.setProperty("--story-progress", String(progress));

      const nextStep = getActiveStoryStep(progress);
      if (nextStep !== activeStepRef.current) {
        activeStepRef.current = nextStep;
        onActiveStep(nextStep);
      }
    }

    function requestMeasure() {
      if (!measureFrame) measureFrame = window.requestAnimationFrame(measure);
    }

    function renderVideo(timestamp: number) {
      if (cancelled) return;
      const video = videoRef.current;
      const difference = targetTimeRef.current - renderedTimeRef.current;

      renderedTimeRef.current += difference * 0.14;
      if (Math.abs(difference) < 0.002) renderedTimeRef.current = targetTimeRef.current;

      if (
        video
        && video.readyState >= HTMLMediaElement.HAVE_METADATA
        && timestamp - lastSeek >= 32
        && Math.abs(video.currentTime - renderedTimeRef.current) > 0.012
      ) {
        video.currentTime = renderedTimeRef.current;
        lastSeek = timestamp;
      }

      playbackFrame = window.requestAnimationFrame(renderVideo);
    }

    measure();
    playbackFrame = window.requestAnimationFrame(renderVideo);
    window.addEventListener("scroll", requestMeasure, { passive: true });
    window.addEventListener("resize", requestMeasure);

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", requestMeasure);
      window.removeEventListener("resize", requestMeasure);
      window.cancelAnimationFrame(measureFrame);
      window.cancelAnimationFrame(playbackFrame);
    };
  }, [containerRef, disabled, onActiveStep, videoRef]);
}
