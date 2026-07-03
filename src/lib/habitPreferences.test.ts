import { afterEach, describe, expect, it, vi } from "vitest";
import { preferredHabitTimes, readHabitPreferences, writeHabitPreferences } from "./habitPreferences";

function mockStorage(initial = "{}") {
  let value = initial;
  vi.stubGlobal("window", {
    localStorage: {
      getItem: () => value,
      setItem: (_key: string, next: string) => { value = next; },
    },
  });
  return () => value;
}

afterEach(() => vi.unstubAllGlobals());

describe("habit preferences", () => {
  it("keeps only valid preferred times", () => {
    mockStorage(JSON.stringify({ valid: { preferredTime: "08:30" }, invalid: { preferredTime: "29:00" } }));
    expect(readHabitPreferences()).toEqual({ valid: { preferredTime: "08:30" } });
  });

  it("persists and flattens preferred times", () => {
    const stored = mockStorage();
    writeHabitPreferences({ habit: { preferredTime: "19:15" }, empty: {} });
    expect(JSON.parse(stored())).toEqual({ habit: { preferredTime: "19:15" }, empty: {} });
    expect(preferredHabitTimes(readHabitPreferences())).toEqual({ habit: "19:15" });
  });
});
