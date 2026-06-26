import type { Goal } from "@/types";

export const userGoalsStorageKey = "winperium-user-goals";

export type StoredGoal = Goal & {
  source: "user";
};

export function readStoredGoals(): StoredGoal[] {
  // API_CONNECTION_POINT: later replace localStorage with GET /routine/goals for the authenticated user.
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(userGoalsStorageKey) ?? "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isStoredGoal);
  } catch {
    return [];
  }
}

export function writeStoredGoals(goals: StoredGoal[]) {
  // API_CONNECTION_POINT: later replace localStorage with POST/PATCH /routine/goals mutations.
  window.localStorage.setItem(userGoalsStorageKey, JSON.stringify(goals));
}

function isStoredGoal(value: unknown): value is StoredGoal {
  if (!value || typeof value !== "object") return false;

  const goal = value as Partial<StoredGoal>;
  return (
    typeof goal.id === "string" &&
    typeof goal.title === "string" &&
    typeof goal.description === "string" &&
    typeof goal.category === "string" &&
    typeof goal.targetDate === "string" &&
    typeof goal.createdAt === "string"
  );
}
