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
type VideoManifest = { version: number; type: string; size: number; parts: string[] };
type VideoAsset =
  | { kind: "manifest"; manifest: string; type: string }
  | { kind: "single"; src: string; type: string };

export function ScrollVideoStory() {
  const landing = useTranslations("landing");
  const { language } = useLanguage();
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const [videoMode, setVideoMode] = useState<VideoMode | null>(null);
  const [activeStep, setActiveStep] = useState<StoryStepId | null>("dreams");
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [preparedVideo, setPreparedVideo] = useState<PreparedVideo | null>(null);
  const { markReady: markLandingMediaReady, reportProgress } = useLandingMediaReady();

  const drawMobileFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return false;

    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return false;

    const density = Math.min(window.devicePixelRatio || 1, 2.5);
    const width = Math.max(1, Math.round(bounds.width * density));
    const height = Math.max(1, Math.round(bounds.height * density));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return false;

    const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
    const drawnWidth = video.videoWidth * scale;
    const drawnHeight = video.videoHeight * scale;
    context.drawImage(
      video,
      (width - drawnWidth) / 2,
      (height - drawnHeight) / 2,
      drawnWidth,
      drawnHeight,
    );
    return true;
  }, []);

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
    if (videoMode !== "mobile" || !videoReady) return;
    let resizeFrame = 0;
    const redraw = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => { drawMobileFrame(); });
    };

    window.addEventListener("resize", redraw);
    window.visualViewport?.addEventListener("resize", redraw);
    return () => {
      window.cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", redraw);
      window.visualViewport?.removeEventListener("resize", redraw);
    };
  }, [drawMobileFrame, videoMode, videoReady]);

  useEffect(() => {
    if (!videoMode || reducedMotion || videoFailed) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 300_000);
    const webmSupported = document.createElement("video").canPlayType('video/webm; codecs="vp9"') !== "";
    const asset: VideoAsset = videoMode === "mobile"
      ? { kind: "manifest", manifest: "/videos/landing-scroll-mobile-premium.json", type: "video/mp4" }
      : webmSupported
        ? { kind: "single", src: "/videos/landing-scroll-desktop.webm", type: "video/webm" }
        : { kind: "single", src: "/videos/landing-scroll-desktop.mp4", type: "video/mp4" };

    async function prepareVideo() {
      try {
        let blob: Blob;

        if (asset.kind === "manifest") {
          const manifestResponse = await fetch(asset.manifest, { cache: "no-cache", signal: controller.signal });
          if (!manifestResponse.ok) throw new Error(`Video manifest failed with ${manifestResponse.status}`);
          const manifest = await manifestResponse.json() as VideoManifest;
          const validManifest = manifest.version === 1
            && manifest.type === asset.type
            && Number.isSafeInteger(manifest.size)
            && manifest.size > 0
            && Array.isArray(manifest.parts)
            && manifest.parts.length > 0
            && manifest.parts.every((part) => (
              typeof part === "string"
              && part.startsWith("/videos/landing-scroll-mobile-premium-")
              && part.endsWith(".part")
              && !part.includes("..")
            ));
          if (!validManifest) throw new Error("Invalid mobile video manifest");

          const receivedByPart = manifest.parts.map(() => 0);
          const partBlobs = await Promise.all(manifest.parts.map(async (part, partIndex) => {
            const response = await fetch(part, { cache: "force-cache", signal: controller.signal });
            if (!response.ok) throw new Error(`Video part failed with ${response.status}`);

            if (!response.body) {
              const partBlob = await response.blob();
              receivedByPart[partIndex] = partBlob.size;
              reportProgress(receivedByPart.reduce((sum, size) => sum + size, 0) / manifest.size);
              return partBlob;
            }

            const reader = response.body.getReader();
            const chunks: ArrayBuffer[] = [];
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = new Uint8Array(value.byteLength);
              chunk.set(value);
              chunks.push(chunk.buffer);
              receivedByPart[partIndex] += value.byteLength;
              reportProgress(receivedByPart.reduce((sum, size) => sum + size, 0) / manifest.size);
            }
            return new Blob(chunks, { type: "application/octet-stream" });
          }));

          blob = new Blob(partBlobs, { type: asset.type });
          if (blob.size !== manifest.size) throw new Error("Incomplete mobile video");
        } else {
          const response = await fetch(asset.src, { cache: "force-cache", signal: controller.signal });
          if (!response.ok) throw new Error(`Video request failed with ${response.status}`);
          const totalBytes = Number(response.headers.get("content-length")) || 0;

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
      title: <><StoryTextSegment>{landing.storyDreamsLead}</StoryTextSegment><br /><SilverHighlight animateByLetter>{landing.storyDreamsHighlight}</SilverHighlight></>,
    },
    goals: {
      title: <><StoryTextSegment>{landing.storyGoalsLead}</StoryTextSegment><br /><SilverHighlight animateByLetter>{landing.storyGoalsHighlight}</SilverHighlight></>,
    },
    path: {
      title: <><StoryTextSegment>{landing.storyPathLead}</StoryTextSegment><br /><SilverHighlight animateByLetter>{landing.storyPathHighlight}</SilverHighlight></>,
    },
    resilience: {
      title: <><StoryTextSegment>{landing.storyResilienceLead}</StoryTextSegment><br /><SilverHighlight animateByLetter>{landing.storyResilienceHighlight}</SilverHighlight></>,
      support: <><StoryTextSegment className="storyPathSupportCopy">{landing.storyPathSupportLead}<br />{landing.storyPathSupportMiddle}</StoryTextSegment><SilverHighlight animateByLetter>{`${landing.storyPathSupportHighlight}.`}</SilverHighlight></>,
    },
    consistency: {
      title: <><StoryTextSegment>{landing.storyConsistencyLead}</StoryTextSegment><br /><StoryTextSegment>{landing.storyConsistencyMiddle}</StoryTextSegment><br /><SilverHighlight animateByLetter>{landing.storyConsistencyHighlight}</SilverHighlight><StoryTextSegment>.</StoryTextSegment></>,
    },
    organization: {
      eyebrow: landing.storyOrganizationEyebrow,
      title: <><StoryTextSegment>{landing.storyOrganizationLead}</StoryTextSegment><br /><StoryTextSegment>{landing.storyOrganizationMiddle}</StoryTextSegment><br /><SilverHighlight animateByLetter>{landing.storyOrganizationHighlight}</SilverHighlight><StoryTextSegment>.</StoryTextSegment></>,
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
    ? "/images/landing-scroll-poster-mobile-premium.webp"
    : "/images/landing-scroll-poster.webp";

  return (
    <section ref={containerRef} className="scrollVideoStory" aria-label={landing.storyAriaLabel}>
      <div className="scrollVideoSticky">
        <div className="storyPoster" style={{ backgroundImage: `url(${poster})` }} aria-hidden="true" />
        {preparedVideo ? (
          <>
            <video
              key={preparedVideo.src}
              ref={videoRef}
              className={`storyVideo ${videoMode === "mobile" ? "storyVideoDecoder" : ""}`}
              data-ready={videoReady && !videoFailed}
              muted
              playsInline
              preload="auto"
              poster={poster}
              src={preparedVideo.src}
              aria-hidden="true"
              tabIndex={-1}
              onLoadedData={() => {
                if (videoMode === "mobile") drawMobileFrame();
                setVideoReady(true);
                markLandingMediaReady();
              }}
              onSeeked={() => {
                if (videoMode === "mobile") drawMobileFrame();
              }}
              onError={() => { setVideoFailed(true); markLandingMediaReady(); }}
            />
            {videoMode === "mobile" ? (
              <canvas
                ref={canvasRef}
                className="storyVideo storyVideoCanvas"
                data-ready={videoReady && !videoFailed}
                aria-hidden="true"
              />
            ) : null}
          </>
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
