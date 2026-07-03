import { describe, expect, it } from "vitest";
import { addDays, startOfWeek, toDateKey, weekRange } from "./date";

describe("date helpers", () => {
  it("formats local dates without UTC shifts", () => {
    expect(toDateKey(new Date(2026, 6, 3, 23, 30))).toBe("2026-07-03");
  });

  it("uses Monday as the beginning of the week", () => {
    expect(toDateKey(startOfWeek(new Date(2026, 6, 5)))).toBe("2026-06-29");
    expect(weekRange(new Date(2026, 6, 5))).toEqual({ start: "2026-06-29", end: "2026-07-05" });
    expect(toDateKey(addDays(new Date(2026, 6, 3), 1))).toBe("2026-07-04");
  });
});
