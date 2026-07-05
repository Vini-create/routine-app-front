import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearFirstAccessTourOffer,
  clearFirstAccessTourProgress,
  hasPendingFirstAccessTourOffer,
  markFirstAccessTourOfferPending,
  readFirstAccessTourProgress,
  requestFirstAccessTour,
  saveFirstAccessTourProgress,
} from "./firstAccessTour";

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
    requestFirstAccessTour();
    expect(readFirstAccessTourProgress(9)).toBe(0);
    expect(window.dispatchEvent).toHaveBeenCalledOnce();
  });
});
