"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "@/components/app/LanguageProvider";
import { SilverHighlight, StoryTextStep } from "./StoryTextStep";
import { storySteps, type StoryStepId } from "./storyConfig";
import { useReducedMotion } from "./useReducedMotion";
import { useScrollVideo } from "./useScrollVideo";
import { useLandingMediaReady } from "./LandingLoadGate";

type VideoMode = "desktop" | "mobile";
type StoryCopy = { title: ReactNode; eyebrow?: string; support?: ReactNode };

export function ScrollVideoStory() {
  const landing = useTranslations("landing");
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const [videoMode, setVideoMode] = useState<VideoMode | null>(null);
  const [activeStep, setActiveStep] = useState<StoryStepId | null>("dreams");
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const markLandingMediaReady = useLandingMediaReady();

  useEffect(() => {
    if (reducedMotion) markLandingMediaReady();
  }, [markLandingMediaReady, reducedMotion]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setVideoMode(query.matches ? "mobile" : "desktop");

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!videoMode || reducedMotion || videoFailed) return;
    const video = videoRef.current;
    if (!video) return;

    const preload = () => {
      video.preload = "auto";
      video.load();
    };
    const browser = window as typeof window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const idleId = browser.requestIdleCallback?.(preload, { timeout: 1400 });
    const timeoutId = idleId === undefined ? window.setTimeout(preload, 500) : 0;

    return () => {
      if (idleId !== undefined) browser.cancelIdleCallback?.(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [reducedMotion, videoFailed, videoMode]);

  const handleActiveStep = useCallback((step: StoryStepId | null) => setActiveStep(step), []);

  useScrollVideo({
    containerRef,
    videoRef,
    disabled: reducedMotion || videoFailed || !videoMode,
    lowPowerMode: videoMode === "mobile",
    onActiveStep: handleActiveStep,
  });

  const storyCopy = useMemo<Record<StoryStepId, StoryCopy>>(() => ({
    dreams: {
      title: <>{landing.storyDreamsLead}<br /><SilverHighlight>{landing.storyDreamsHighlight}</SilverHighlight></>,
    },
    goals: {
      title: <>{landing.storyGoalsLead}<br /><SilverHighlight>{landing.storyGoalsHighlight}</SilverHighlight></>,
    },
    path: {
      title: <>{landing.storyPathLead}<br /><SilverHighlight>{landing.storyPathHighlight}</SilverHighlight></>,
      support: <><span className="storyPathSupportCopy">{landing.storyPathSupportLead}<br />{landing.storyPathSupportMiddle}</span><SilverHighlight>{landing.storyPathSupportHighlight}.</SilverHighlight></>,
    },
    consistency: {
      title: <>{landing.storyConsistencyLead}<br />{landing.storyConsistencyMiddle}<br /><SilverHighlight>{landing.storyConsistencyHighlight}</SilverHighlight>.</>,
    },
    organization: {
      eyebrow: landing.storyOrganizationEyebrow,
      title: <>{landing.storyOrganizationLead}<br />{landing.storyOrganizationMiddle}<br /><SilverHighlight>{landing.storyOrganizationHighlight}</SilverHighlight>.</>,
    },
  }), [landing]);

  if (reducedMotion) {
    return (
      <section className="reducedStory" aria-label={landing.storyAriaLabel}>
        {storySteps.map((step) => {
          const copy = storyCopy[step.id];
          const TitleTag = step.id === "dreams" ? "h1" : "h2";
          return (
            <article className="reducedStoryScene" key={step.id}>
              <div className="reducedStoryImage">
                <Image src={step.poster} alt="" fill sizes="100vw" className="object-contain" />
              </div>
              <div className="reducedStoryCopy">
                {copy.eyebrow ? <p className="storyEyebrow text-body">{copy.eyebrow}</p> : null}
                <TitleTag className="story-title text-display">{copy.title}</TitleTag>
                {copy.support ? <p className="storySupport text-display-medium">{copy.support}</p> : null}
              </div>
            </article>
          );
        })}
      </section>
    );
  }

  const sourceBase = videoMode ? `/videos/landing-scroll-${videoMode}` : null;
  const poster = videoMode === "mobile"
    ? "/images/landing-scroll-poster-mobile.webp"
    : "/images/landing-scroll-poster.webp";

  return (
    <section ref={containerRef} className="scrollVideoStory" aria-label={landing.storyAriaLabel}>
      <div className="scrollVideoSticky">
        <div className="storyPoster" style={{ backgroundImage: `url(${poster})` }} aria-hidden="true" />
        {sourceBase ? (
          <video
            key={videoMode}
            ref={videoRef}
            className="storyVideo"
            data-ready={videoReady && !videoFailed}
            muted
            playsInline
            preload="metadata"
            poster={poster}
            aria-hidden="true"
            tabIndex={-1}
            onLoadedData={() => { setVideoReady(true); markLandingMediaReady(); }}
            onError={() => { setVideoFailed(true); markLandingMediaReady(); }}
          >
            {videoMode === "mobile" ? (
              <>
                <source src={`${sourceBase}.mp4`} type="video/mp4" />
                <source src={`${sourceBase}.webm`} type="video/webm" />
              </>
            ) : (
              <>
                <source src={`${sourceBase}.webm`} type="video/webm" />
                <source src={`${sourceBase}.mp4`} type="video/mp4" />
              </>
            )}
          </video>
        ) : null}
        <div className="storyVignette" aria-hidden="true" />

        <div className="storyCopyLayer">
          {storySteps.map((step) => {
            const copy = storyCopy[step.id];
            return (
              <StoryTextStep
                key={step.id}
                step={step}
                active={activeStep === step.id}
                eyebrow={copy.eyebrow}
                title={copy.title}
                support={copy.support}
              />
            );
          })}
        </div>

        <div className="storyProgress" aria-hidden="true">
          {storySteps.map((step) => <i key={step.id} data-active={activeStep === step.id} />)}
        </div>
        <p className="storyScrollHint text-body" data-hidden={activeStep !== "dreams"}>
          <span />{landing.scrollToTransform}
        </p>
      </div>
    </section>
  );
}
