import { describe, expect, it } from "vitest";
import { goalDeadlineProgress } from "./goalDeadline";

describe("goalDeadlineProgress", () => {
  const goal = {
    created_at: "2026-07-01T12:00:00-03:00",
    target_date: "2026-07-11",
  };

  it("calculates elapsed deadline percentage and remaining days", () => {
    expect(goalDeadlineProgress(goal, new Date("2026-07-06T10:00:00-03:00"))).toEqual({
      percentage: 50,
      daysRemaining: 5,
      expired: false,
    });
  });

  it("reaches 100 percent on the target date", () => {
    expect(goalDeadlineProgress(goal, new Date("2026-07-11T10:00:00-03:00"))).toEqual({
      percentage: 100,
      daysRemaining: 0,
      expired: false,
    });
  });

  it("marks a past target date as expired", () => {
    expect(goalDeadlineProgress(goal, new Date("2026-07-12T10:00:00-03:00"))).toEqual({
      percentage: 100,
      daysRemaining: 0,
      expired: true,
    });
  });
});
