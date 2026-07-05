import { describe, expect, it } from "vitest";
import { calculateTooltipLayout, normalizeSpotlightRect, type SpotlightRect } from "./tourPosition";

function rect(top: number, left: number, width: number, height: number): SpotlightRect {
  return { top, left, width, height, right: left + width, bottom: top + height };
}

describe("tour positioning", () => {
  it("places a mobile tooltip below a component near the top", () => {
    const target = rect(70, 20, 320, 80);
    const layout = calculateTooltipLayout(target, { width: 310, height: 210 }, { width: 360, height: 800 }, "auto");
    expect(layout.placement).toBe("bottom");
    expect(Number(layout.style.top)).toBeGreaterThan(target.bottom);
    expect(Number(layout.style.left)).toBeGreaterThanOrEqual(10);
    expect(Number(layout.style.left) + Number(layout.style.width)).toBeLessThanOrEqual(350);
  });

  it("places the tooltip above a bottom navigation without overlap", () => {
    const target = rect(710, 16, 328, 66);
    const layout = calculateTooltipLayout(target, { width: 320, height: 220 }, { width: 360, height: 800 }, "auto");
    expect(layout.placement).toBe("top");
    expect(Number(layout.style.top) + Math.min(220, Number(layout.style.maxHeight))).toBeLessThanOrEqual(target.top);
  });

  it("honors a desktop side placement when it fits", () => {
    const target = rect(180, 120, 300, 180);
    const layout = calculateTooltipLayout(target, { width: 320, height: 210 }, { width: 1440, height: 900 }, "right");
    expect(layout.placement).toBe("right");
    expect(Number(layout.style.left)).toBeGreaterThan(target.right);
  });

  it("keeps edge tooltips inside a landscape viewport", () => {
    const target = rect(10, 250, 100, 90);
    const layout = calculateTooltipLayout(target, { width: 320, height: 230 }, { width: 360, height: 320 }, "bottom");
    expect(Number(layout.style.left)).toBeGreaterThanOrEqual(10);
    expect(Number(layout.style.top)).toBeGreaterThanOrEqual(10);
    expect(Number(layout.style.left) + Number(layout.style.width)).toBeLessThanOrEqual(350);
    expect(Number(layout.style.top) + Number(layout.style.maxHeight)).toBeLessThanOrEqual(310);
  });

  it("clips an off-screen target to the visible viewport without negative sizes", () => {
    const normalized = normalizeSpotlightRect({ top: -80, left: -20, right: 380, bottom: 260 }, 360, 640);
    expect(normalized.top).toBe(10);
    expect(normalized.left).toBe(10);
    expect(normalized.right).toBe(350);
    expect(normalized.width).toBeGreaterThan(0);
    expect(normalized.height).toBeGreaterThan(0);
  });
});
