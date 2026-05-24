import type { RoutineBlock } from "@/types";

export const defaultRoutineStorageKey = "rotina-ai-default-routine";

export type DefaultRoutineItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  duration: string;
  category: RoutineBlock["category"];
  energy: RoutineBlock["energy"];
  scheduledDays: number[];
};

export type VacationPeriod = {
  start: string;
  end: string;
};

export type DefaultRoutineSettings = {
  items: DefaultRoutineItem[];
  vacation?: VacationPeriod;
};

export function readDefaultRoutineSettings(): DefaultRoutineSettings {
  // API_CONNECTION_POINT: later replace localStorage with GET /routine/default-settings.
  if (typeof window === "undefined") return { items: [] };

  try {
    const parsed = JSON.parse(window.localStorage.getItem(defaultRoutineStorageKey) ?? "{}");
    return normalizeDefaultRoutineSettings(parsed);
  } catch {
    return { items: [] };
  }
}

export function writeDefaultRoutineSettings(settings: DefaultRoutineSettings) {
  // API_CONNECTION_POINT: later replace localStorage with PATCH /routine/default-settings.
  window.localStorage.setItem(defaultRoutineStorageKey, JSON.stringify(settings));
}

function normalizeDefaultRoutineSettings(value: unknown): DefaultRoutineSettings {
  if (!value || typeof value !== "object") return { items: [] };

  const settings = value as Partial<DefaultRoutineSettings>;
  const items = Array.isArray(settings.items) ? settings.items.filter(isDefaultRoutineItem) : [];
  const vacation = isVacationPeriod(settings.vacation) ? settings.vacation : undefined;

  return { items, vacation };
}

function isDefaultRoutineItem(value: unknown): value is DefaultRoutineItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<DefaultRoutineItem>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.description === "string" &&
    typeof item.time === "string" &&
    typeof item.duration === "string" &&
    (item.category === "saude" || item.category === "foco" || item.category === "trabalho" || item.category === "descanso" || item.category === "reflexao") &&
    (item.energy === "baixa" || item.energy === "media" || item.energy === "alta") &&
    Array.isArray(item.scheduledDays) &&
    item.scheduledDays.every((day) => Number.isInteger(day) && day >= 0 && day <= 6)
  );
}

function isVacationPeriod(value: unknown): value is VacationPeriod {
  if (!value || typeof value !== "object") return false;

  const vacation = value as Partial<VacationPeriod>;
  return typeof vacation.start === "string" && typeof vacation.end === "string";
}
