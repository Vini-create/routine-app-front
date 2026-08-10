"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import { getActiveStoryStep, getClimbToTimelapseFade, mapScrollToVideoTime, type StoryStepId } from "./storyConfig";

export function useScrollVideo({
  containerRef,
  videoRef,
  disabled,
  lowPowerMode,
  onActiveStep,
}: {
  containerRef: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  disabled: boolean;
  lowPowerMode: boolean;
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
    let storyVisible = true;
    // Mobile uses a 24 fps all-intra encode: every source frame can be decoded
    // independently. Quantizing seeks avoids uneven requests between frames.
    const seekInterval = 32;
    const seekThreshold = lowPowerMode ? 1 / 48 : 0.012;
    const smoothing = lowPowerMode ? 0.38 : 0.14;

    function measure() {
      measureFrame = 0;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      storyVisible = rect.bottom > 0 && rect.top < window.innerHeight;
      // The final viewport is reserved for the next section to rise over the
      // pinned summit frame. Excluding it keeps the original video pacing.
      const distance = Math.max(1, rect.height - (window.innerHeight * 2));
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      targetTimeRef.current = mapScrollToVideoTime(progress);
      container.style.setProperty("--story-progress", String(progress));
      container.style.setProperty("--story-cut-fade", String(getClimbToTimelapseFade(progress)));

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
      if (cancelled || !storyVisible) {
        playbackFrame = 0;
        return;
      }
      const video = videoRef.current;
      const difference = targetTimeRef.current - renderedTimeRef.current;

      renderedTimeRef.current += difference * smoothing;
      if (Math.abs(difference) < 0.002) renderedTimeRef.current = targetTimeRef.current;
      const requestedTime = lowPowerMode
        ? Math.round(renderedTimeRef.current * 24) / 24
        : renderedTimeRef.current;
      const lastDisplayableTime = video && Number.isFinite(video.duration)
        ? Math.max(0, video.duration - (1 / 48))
        : requestedTime;
      const seekTime = Math.min(requestedTime, lastDisplayableTime);

      if (
        video
        && storyVisible
        && !document.hidden
        && !video.seeking
        && video.readyState >= HTMLMediaElement.HAVE_METADATA
        && timestamp - lastSeek >= seekInterval
        && Math.abs(video.currentTime - seekTime) > seekThreshold
      ) {
        video.currentTime = seekTime;
        lastSeek = timestamp;
      }

      playbackFrame = window.requestAnimationFrame(renderVideo);
    }

    function startPlayback() {
      if (!playbackFrame && storyVisible && !cancelled) {
        playbackFrame = window.requestAnimationFrame(renderVideo);
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      storyVisible = entry.isIntersecting;
      if (storyVisible) {
        measure();
        startPlayback();
      } else if (playbackFrame) {
        window.cancelAnimationFrame(playbackFrame);
        playbackFrame = 0;
      }
    });

    const container = containerRef.current;
    if (container) observer.observe(container);

    measure();
    startPlayback();
    window.addEventListener("scroll", requestMeasure, { passive: true });
    window.addEventListener("resize", requestMeasure);

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", requestMeasure);
      window.removeEventListener("resize", requestMeasure);
      observer.disconnect();
      window.cancelAnimationFrame(measureFrame);
      window.cancelAnimationFrame(playbackFrame);
    };
  }, [containerRef, disabled, lowPowerMode, onActiveStep, videoRef]);
}
