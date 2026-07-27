import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearFirstAccessTourOffer,
  clearFirstAccessTourProgress,
  completeFirstAccessTour,
  hasCompletedFirstAccessTour,
  hasPendingFirstAccessTourOffer,
  markFirstAccessTourOfferPending,
  readFirstAccessTourProgress,
  requestFirstAccessTour,
  saveFirstAccessTourProgress,
} from "./firstAccessTour";
import { essentialFirstAccessTourSteps, expandedFirstAccessTourSteps, firstAccessTourCopy } from "../data/firstAccessTour";

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("first access tour", () => {
  beforeEach(() => vi.stubGlobal("window", {
    sessionStorage: createStorage(),
    localStorage: createStorage(),
    dispatchEvent: vi.fn(),
  }));
  afterEach(() => vi.unstubAllGlobals());

  it("shows and consumes the invitation created by a new login", () => {
    markFirstAccessTourOfferPending();
    expect(hasPendingFirstAccessTourOffer()).toBe(true);
    clearFirstAccessTourOffer();
    expect(hasPendingFirstAccessTourOffer()).toBe(false);
  });

  it("keeps valid progress only for the current login session", () => {
    saveFirstAccessTourProgress(4);
    expect(readFirstAccessTourProgress(9)).toBe(4);
    clearFirstAccessTourProgress();
    expect(readFirstAccessTourProgress(9)).toBeNull();
  });

  it("rejects progress outside the available steps", () => {
    saveFirstAccessTourProgress(20);
    expect(readFirstAccessTourProgress(9)).toBeNull();
  });

  it("starts a manual replay from the first step", () => {
    completeFirstAccessTour("user-a");
    requestFirstAccessTour("user-a");
    expect(readFirstAccessTourProgress(9)).toBe(0);
    expect(hasCompletedFirstAccessTour("user-a")).toBe(false);
    expect(window.dispatchEvent).toHaveBeenCalledOnce();
  });

  it("persists completion separately for each user", () => {
    markFirstAccessTourOfferPending();
    completeFirstAccessTour("user-a");
    expect(hasCompletedFirstAccessTour("user-a")).toBe(true);
    expect(hasCompletedFirstAccessTour("user-b")).toBe(false);
    expect(hasPendingFirstAccessTourOffer()).toBe(false);
  });

  it("provides a component target throughout every supported language", () => {
    Object.values(firstAccessTourCopy).forEach((copy) => {
      const steps = expandedFirstAccessTourSteps(copy);
      expect(steps.length).toBeGreaterThan(20);
      expect(steps.every((step) => Boolean(step.id) && Boolean(step.selector) && Boolean(step.preferredPlacement))).toBe(true);
      expect(new Set(steps.map((step) => step.id)).size).toBe(steps.length);
    });
  });

  it("keeps the complete habit walkthrough in every language", () => {
    const requiredHabitSteps = [
      "habits-title", "page-info-button", "habit-add", "habit-guide",
      "habit-consistency-fire", "habit-consistency-grass", "habit-consistency-ice",
      "habit-consistency-empty", "habit-card", "habit-controls", "app-navigation",
    ];
    Object.values(firstAccessTourCopy).forEach((copy) => {
      const habitIds = expandedFirstAccessTourSteps(copy).filter((step) => step.route === "/habits").map((step) => step.id);
      expect(habitIds.map((id) => id.split(":").at(-1))).toEqual(requiredHabitSteps);
    });
  });

  it("keeps the walkthrough focused on the main flow on every viewport", () => {
    Object.entries(firstAccessTourCopy).forEach(([language, copy]) => {
      const fullTour = expandedFirstAccessTourSteps(copy);
      const essentialTour = essentialFirstAccessTourSteps(fullTour, language as keyof typeof firstAccessTourCopy);
      expect(essentialTour).toHaveLength(15);
      expect(essentialTour.length).toBeLessThan(fullTour.length);
      expect(essentialTour.every((step) => step.description.length <= 80)).toBe(true);
      expect(essentialTour.some((step) => step.selector.includes("page-info-button"))).toBe(false);
      expect(essentialTour.some((step) => step.selector.includes("habit-consistency-fire"))).toBe(false);
      expect(new Set(essentialTour.map((step) => step.route))).toEqual(new Set(fullTour.map((step) => step.route)));
    });
  });
});
