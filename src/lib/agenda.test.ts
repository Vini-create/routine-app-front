import { describe, expect, it } from "vitest";
import type { RoutineItem } from "./api-contracts";
import { routineItemCalendarMarkers } from "./agenda";

function item(overrides: Partial<RoutineItem> = {}): RoutineItem {
  return {
    id: "item-1",
    schedule_type: "single",
    start_at: "2026-07-24T14:00:00-03:00",
    end_at: null,
    recurrence_rule: null,
    item_type: "event",
    description: null,
    title: "Evento",
    goal_id: null,
    duration_minutes: 60,
    ...overrides,
  };
}

describe("routine item calendar markers", () => {
  it("shows a saved single event on its calendar date", () => {
    expect(routineItemCalendarMarkers([item()], "2026-07-01", "2026-07-31")).toEqual([
      { key: "item-1-2026-07-24", date: "2026-07-24", itemType: "event" },
    ]);
  });

  it("shows recurring reminders and ignores common item types", () => {
    const markers = routineItemCalendarMarkers([
      item({ id: "reminder", item_type: "reminder", schedule_type: "recurring", start_at: "2026-07-01T09:00:00-03:00", end_at: "2026-07-31T09:00:00-03:00", recurrence_rule: "FREQ=WEEKLY;BYDAY=FR" }),
      item({ id: "task", item_type: "task" }),
    ], "2026-07-20", "2026-07-26");
    expect(markers).toEqual([
      { key: "reminder-2026-07-24", date: "2026-07-24", itemType: "reminder" },
    ]);
  });
});
