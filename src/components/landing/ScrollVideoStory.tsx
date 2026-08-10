"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage, useTranslations } from "@/components/app/LanguageProvider";
import { SilverHighlight, StoryTextSegment, StoryTextStep } from "./StoryTextStep";
import { storySteps, type StoryStepId } from "./storyConfig";
import { useReducedMotion } from "./useReducedMotion";
import { useScrollVideo } from "./useScrollVideo";
import { useLandingMediaReady } from "./LandingLoadGate";

type VideoMode = "desktop" | "mobile";
type StoryCopy = { title: ReactNode; eyebrow?: string; support?: ReactNode };
type PreparedVideo = { src: string; type: string };

export function ScrollVideoStory() {
  const landing = useTranslations("landing");
  const { language } = useLanguage();
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const [videoMode, setVideoMode] = useState<VideoMode | null>(null);
  const [activeStep, setActiveStep] = useState<StoryStepId | null>("dreams");
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [preparedVideo, setPreparedVideo] = useState<PreparedVideo | null>(null);
  const { markReady: markLandingMediaReady, reportProgress } = useLandingMediaReady();

  useEffect(() => {
    if (reducedMotion) {
      reportProgress(1);
      markLandingMediaReady();
    }
  }, [markLandingMediaReady, reducedMotion, reportProgress]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px) and (orientation: portrait)");
    const update = () => {
      setVideoReady(false);
      setVideoFailed(false);
      setPreparedVideo(null);
      reportProgress(0);
      setVideoMode(query.matches ? "mobile" : "desktop");
    };

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [reportProgress]);

  useEffect(() => {
    if (!videoMode || reducedMotion || videoFailed) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 120_000);
    const webmSupported = document.createElement("video").canPlayType('video/webm; codecs="vp9"') !== "";
    const asset = videoMode === "desktop" && webmSupported
      ? { src: "/videos/landing-scroll-desktop.webm", type: "video/webm" }
      : { src: `/videos/landing-scroll-${videoMode}.mp4`, type: "video/mp4" };

    async function prepareVideo() {
      try {
        const response = await fetch(asset.src, { cache: "force-cache", signal: controller.signal });
        if (!response.ok) throw new Error(`Video request failed with ${response.status}`);

        const totalBytes = Number(response.headers.get("content-length")) || 0;
        let blob: Blob;

        if (!response.body || !totalBytes) {
          reportProgress(null);
          blob = await response.blob();
        } else {
          const reader = response.body.getReader();
          const chunks: ArrayBuffer[] = [];
          let receivedBytes = 0;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = new Uint8Array(value.byteLength);
            chunk.set(value);
            chunks.push(chunk.buffer);
            receivedBytes += value.byteLength;
            reportProgress(receivedBytes / totalBytes);
          }

          blob = new Blob(chunks, { type: asset.type });
        }

        if (cancelled) return;
        reportProgress(1);
        objectUrl = URL.createObjectURL(blob);
        setPreparedVideo({ src: objectUrl, type: asset.type });
      } catch {
        if (cancelled) return;
        setVideoFailed(true);
        reportProgress(1);
        markLandingMediaReady();
      }
    }

    void prepareVideo();

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeoutId);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [markLandingMediaReady, reducedMotion, reportProgress, videoFailed, videoMode]);

  const handleActiveStep = useCallback((step: StoryStepId | null) => setActiveStep(step), []);

  useScrollVideo({
    containerRef,
    videoRef,
    disabled: reducedMotion || videoFailed || !videoMode || !preparedVideo,
    lowPowerMode: videoMode === "mobile",
    onActiveStep: handleActiveStep,
  });

  const storyCopy = useMemo<Record<StoryStepId, StoryCopy>>(() => ({
    dreams: {
      title: <><StoryTextSegment>{landing.storyDreamsLead}</StoryTextSegment><br /><SilverHighlight>{landing.storyDreamsHighlight}</SilverHighlight></>,
    },
    goals: {
      title: <><StoryTextSegment>{landing.storyGoalsLead}</StoryTextSegment><br /><SilverHighlight>{landing.storyGoalsHighlight}</SilverHighlight></>,
    },
    path: {
      title: <><StoryTextSegment>{landing.storyPathLead}</StoryTextSegment><br /><SilverHighlight>{landing.storyPathHighlight}</SilverHighlight></>,
    },
    resilience: {
      title: <><StoryTextSegment>{landing.storyResilienceLead}</StoryTextSegment><br /><SilverHighlight>{landing.storyResilienceHighlight}</SilverHighlight></>,
      support: <><StoryTextSegment className="storyPathSupportCopy">{landing.storyPathSupportLead}<br />{landing.storyPathSupportMiddle}</StoryTextSegment><SilverHighlight>{landing.storyPathSupportHighlight}.</SilverHighlight></>,
    },
    consistency: {
      title: <><StoryTextSegment>{landing.storyConsistencyLead}</StoryTextSegment><br /><StoryTextSegment>{landing.storyConsistencyMiddle}</StoryTextSegment><br /><SilverHighlight>{landing.storyConsistencyHighlight}</SilverHighlight><StoryTextSegment>.</StoryTextSegment></>,
    },
    organization: {
      eyebrow: landing.storyOrganizationEyebrow,
      title: <><StoryTextSegment>{landing.storyOrganizationLead}</StoryTextSegment><br /><StoryTextSegment>{landing.storyOrganizationMiddle}</StoryTextSegment><br /><SilverHighlight>{landing.storyOrganizationHighlight}</SilverHighlight><StoryTextSegment>.</StoryTextSegment></>,
    },
  }), [landing]);

  if (reducedMotion || videoFailed) {
    return (
      <section className="reducedStory" aria-label={landing.storyAriaLabel}>
        {storySteps.map((step, index) => {
          const copy = storyCopy[step.id];
          const TitleTag = step.id === "dreams" ? "h1" : "h2";
          return (
            <article className="reducedStoryScene" key={step.id}>
              <div className="reducedStoryImage">
                <Image src={step.poster} alt="" fill sizes="100vw" className="object-cover" />
              </div>
              <div className="reducedStoryCopy">
                <p className="storyChapter" aria-hidden="true">
                  <span>{String(index + 1).padStart(2, "0")}</span><i /><span>{String(storySteps.length).padStart(2, "0")}</span>
                </p>
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

  const poster = videoMode === "mobile"
    ? "/images/landing-scroll-poster-mobile.webp"
    : "/images/landing-scroll-poster.webp";

  return (
    <section ref={containerRef} className="scrollVideoStory" aria-label={landing.storyAriaLabel}>
      <div className="scrollVideoSticky">
        <div className="storyPoster" style={{ backgroundImage: `url(${poster})` }} aria-hidden="true" />
        {preparedVideo ? (
          <video
            key={preparedVideo.src}
            ref={videoRef}
            className="storyVideo"
            data-ready={videoReady && !videoFailed}
            muted
            playsInline
            preload="auto"
            poster={poster}
            src={preparedVideo.src}
            aria-hidden="true"
            tabIndex={-1}
            onLoadedData={() => {
              setVideoReady(true);
              markLandingMediaReady();
            }}
            onError={() => { setVideoFailed(true); markLandingMediaReady(); }}
          />
        ) : null}
        <div className="storyVignette" aria-hidden="true" />
        <div className="storyCutFade" aria-hidden="true" />

        <div className="storyCopyLayer">
          {storySteps.map((step, index) => {
            const copy = storyCopy[step.id];
            return (
              <StoryTextStep
                key={`${step.id}-${language}`}
                step={step}
                active={activeStep === step.id}
                eyebrow={copy.eyebrow}
                title={copy.title}
                support={copy.support}
                index={index}
                total={storySteps.length}
              />
            );
          })}
        </div>

        <div className="storyProgress" aria-hidden="true"><span><i /></span></div>
        <p className="storyScrollHint text-body" data-hidden={activeStep !== "dreams"}>
          <span />{landing.scrollToTransform}
        </p>
      </div>
    </section>
  );
}
