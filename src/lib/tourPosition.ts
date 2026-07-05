import type { CSSProperties } from "react";
import type { TourPlacement } from "@/data/firstAccessTour";

export type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};

export type TooltipLayout = {
  placement: Exclude<TourPlacement, "auto">;
  style: CSSProperties;
  arrowStyle: CSSProperties;
};

export const tourViewportMargin = 10;
const spotlightPadding = 7;
const tooltipGap = 14;

export function normalizeSpotlightRect(rect: Pick<DOMRect, "top" | "left" | "right" | "bottom">, viewportWidth: number, viewportHeight: number): SpotlightRect {
  const visibleTop = Math.max(tourViewportMargin, rect.top - spotlightPadding);
  const visibleBottom = Math.min(viewportHeight - tourViewportMargin, rect.bottom + spotlightPadding);
  const height = Math.max(1, visibleBottom - visibleTop);
  const left = Math.max(tourViewportMargin, rect.left - spotlightPadding);
  const right = Math.min(viewportWidth - tourViewportMargin, rect.right + spotlightPadding);

  return { top: visibleTop, left, width: Math.max(1, right - left), height, right, bottom: visibleTop + height };
}

export function calculateTooltipLayout(
  target: SpotlightRect,
  tooltip: { width: number; height: number },
  viewport: { width: number; height: number },
  preferred: TourPlacement,
): TooltipLayout {
  const canOverlapTarget = viewport.width < 640;
  const width = Math.min(Math.max(260, tooltip.width || 320), viewport.width - tourViewportMargin * 2);
  const measuredHeight = Math.max(170, tooltip.height || 230);
  const space = {
    bottom: viewport.height - target.bottom - tourViewportMargin,
    top: target.top - tourViewportMargin,
    right: viewport.width - target.right - tourViewportMargin,
    left: target.left - tourViewportMargin,
  };
  const needed = {
    bottom: measuredHeight + tooltipGap,
    top: measuredHeight + tooltipGap,
    right: width + tooltipGap,
    left: width + tooltipGap,
  };
  const automaticOrder = (Object.keys(space) as Array<Exclude<TourPlacement, "auto">>)
    .sort((a, b) => (space[b] / needed[b]) - (space[a] / needed[a]));
  const candidates = preferred === "auto" ? automaticOrder : [preferred, ...automaticOrder.filter((placement) => placement !== preferred)];
  const viableFallback = automaticOrder.filter((candidate) => candidate === "top" || candidate === "bottom" || space[candidate] >= 260 + tooltipGap);
  const fittingPlacement = candidates.find((candidate) => space[candidate] >= needed[candidate]);
  const placement = fittingPlacement
    ?? (canOverlapTarget ? (target.top + target.height / 2 > viewport.height / 2 ? "top" : "bottom") : undefined)
    ?? viableFallback[0]
    ?? automaticOrder[0];
  const horizontalCenter = target.left + target.width / 2;
  const verticalCenter = target.top + target.height / 2;
  let left = horizontalCenter - width / 2;
  let top = target.bottom + tooltipGap;
  let maxHeight = Math.max(60, space.bottom - tooltipGap);
  let renderedHeight = Math.min(measuredHeight, maxHeight);

  if (placement === "top") {
    maxHeight = Math.max(60, space.top - tooltipGap);
    renderedHeight = Math.min(measuredHeight, maxHeight);
    top = target.top - tooltipGap - renderedHeight;
  } else if (placement === "right") {
    left = target.right + tooltipGap;
    maxHeight = viewport.height - tourViewportMargin * 2;
    renderedHeight = Math.min(measuredHeight, maxHeight);
    top = verticalCenter - renderedHeight / 2;
  } else if (placement === "left") {
    left = target.left - tooltipGap - width;
    maxHeight = viewport.height - tourViewportMargin * 2;
    renderedHeight = Math.min(measuredHeight, maxHeight);
    top = verticalCenter - renderedHeight / 2;
  }

  left = Math.min(Math.max(tourViewportMargin, left), viewport.width - tourViewportMargin - width);
  top = Math.min(Math.max(tourViewportMargin, top), viewport.height - tourViewportMargin - renderedHeight);
  maxHeight = Math.max(60, Math.min(maxHeight, viewport.height - top - tourViewportMargin));

  if (canOverlapTarget && !fittingPlacement) {
    renderedHeight = measuredHeight;
    top = placement === "top"
      ? target.top - tooltipGap - renderedHeight
      : target.bottom + tooltipGap;
    top = Math.min(
      Math.max(tourViewportMargin, top),
      Math.max(tourViewportMargin, viewport.height - tourViewportMargin - renderedHeight),
    );
    maxHeight = viewport.height - tourViewportMargin * 2;
  }

  const arrowSize = 12;
  const arrowInset = 22;
  const arrowStyle = placement === "bottom" || placement === "top"
    ? { left: Math.min(Math.max(arrowInset, horizontalCenter - left - arrowSize / 2), width - arrowInset - arrowSize) }
    : { top: Math.min(Math.max(arrowInset, verticalCenter - top - arrowSize / 2), renderedHeight - arrowInset - arrowSize) };

  return { placement, style: { left, top, width, maxHeight }, arrowStyle };
}

export function overlayStyle(top: number, left: number, width: number, height: number): CSSProperties {
  return { top, left, width: Math.max(0, width), height: Math.max(0, height) };
}
