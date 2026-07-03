export const habitPreferencesStorageKey = "rotina-ai-habit-preferences";

export type HabitPreferences = Record<string, { preferredTime?: string }>;

export function readHabitPreferences(): HabitPreferences {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(habitPreferencesStorageKey) ?? "{}") as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => {
      if (!value || typeof value !== "object") return false;
      const time = (value as { preferredTime?: unknown }).preferredTime;
      return time === undefined || (typeof time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(time));
    })) as HabitPreferences;
  } catch {
    return {};
  }
}

export function writeHabitPreferences(preferences: HabitPreferences) {
  window.localStorage.setItem(habitPreferencesStorageKey, JSON.stringify(preferences));
}

export function preferredHabitTimes(preferences: HabitPreferences) {
  return Object.fromEntries(Object.entries(preferences).map(([id, value]) => [id, value.preferredTime]).filter((entry): entry is [string, string] => Boolean(entry[1])));
}
