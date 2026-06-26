import type { Habit } from "@/types";

export const userHabitsStorageKey = "rotina-ai-user-habits";

export type StoredHabit = Habit & {
  source: "user";
  createdAt: string;
};

export function readStoredHabits(): StoredHabit[] {
  // API_CONNECTION_POINT: later replace localStorage with GET /habits for the authenticated user.
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(userHabitsStorageKey) ?? "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isStoredHabit);
  } catch {
    return [];
  }
}

export function writeStoredHabits(habits: StoredHabit[]) {
  // API_CONNECTION_POINT: later replace localStorage with POST/PATCH /habits mutations.
  window.localStorage.setItem(userHabitsStorageKey, JSON.stringify(habits));
}

function isStoredHabit(value: unknown): value is StoredHabit {
  if (!value || typeof value !== "object") return false;

  const habit = value as Partial<StoredHabit>;
  return (
    typeof habit.id === "string" &&
    typeof habit.name === "string" &&
    typeof habit.category === "string" &&
    typeof habit.frequency === "string" &&
    typeof habit.preferredTime === "string" &&
    (habit.recurrenceType === undefined || habit.recurrenceType === "weekly" || habit.recurrenceType === "monthly") &&
    (habit.scheduledDays === undefined || (
      Array.isArray(habit.scheduledDays) &&
      habit.scheduledDays.every((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    )) &&
    (habit.monthlyDays === undefined || (
      Array.isArray(habit.monthlyDays) &&
      habit.monthlyDays.every((day) => Number.isInteger(day) && day >= 1 && day <= 31)
    ))
  );
}
