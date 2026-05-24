import type { Habit } from "@/types";

export const routineHabitRecordsStorageKey = "rotina-ai-routine-habit-records";

export type RoutineHabitRecordStatus = "done" | "partial" | "low";

export type RoutineHabitRecord = {
  habitId: string;
  date: string;
  status: RoutineHabitRecordStatus;
  sourceBlockId?: string;
  updatedAt: string;
};

export type HabitWeekDayStatus = "done" | "partial" | "low" | "future" | "off";

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getCurrentWeekDates(today = new Date()) {
  const normalizedToday = startOfDay(today);
  const mondayOffset = normalizedToday.getDay() === 0 ? -6 : 1 - normalizedToday.getDay();
  const monday = new Date(normalizedToday);
  monday.setDate(normalizedToday.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

export function readRoutineHabitRecords(): RoutineHabitRecord[] {
  // API_CONNECTION_POINT: later replace localStorage with GET /routine/habit-records for the current week.
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(routineHabitRecordsStorageKey) ?? "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isRoutineHabitRecord);
  } catch {
    return [];
  }
}

export function writeRoutineHabitRecords(records: RoutineHabitRecord[]) {
  // API_CONNECTION_POINT: later replace localStorage with POST/PATCH /routine/habit-records.
  window.localStorage.setItem(routineHabitRecordsStorageKey, JSON.stringify(records));
}

export function upsertRoutineHabitRecord(records: RoutineHabitRecord[], record: RoutineHabitRecord) {
  const next = records.filter((item) => !(item.habitId === record.habitId && item.date === record.date));
  return [...next, record];
}

export function removeRoutineHabitRecord(records: RoutineHabitRecord[], habitId: string, date: string) {
  return records.filter((item) => !(item.habitId === habitId && item.date === date));
}

export function getHabitRoutineStats(habit: Habit, records: RoutineHabitRecord[], today = new Date()) {
  const normalizedToday = startOfDay(today);
  const weekDates = getCurrentWeekDates(normalizedToday);
  const scheduledDays = habit.scheduledDays?.length ? habit.scheduledDays : [0, 1, 2, 3, 4, 5, 6];
  const habitRecords = records.filter((record) => record.habitId === habit.id);
  const recordsByDate = new Map(habitRecords.map((record) => [record.date, record]));
  const eligibleDates = weekDates.filter((date) => scheduledDays.includes(date.getDay()) && startOfDay(date) <= normalizedToday);
  const recordedEligibleDates = eligibleDates.filter((date) => recordsByDate.has(dateKey(date)));
  const hasEnoughRoutineData = recordedEligibleDates.length > 0;

  const score = recordedEligibleDates.reduce((total, date) => {
    const status = recordsByDate.get(dateKey(date))?.status;
    if (status === "done") return total + 1;
    if (status === "partial") return total + 0.5;
    return total;
  }, 0);

  const weeklyProgress = hasEnoughRoutineData
    ? Math.round((score / recordedEligibleDates.length) * 100)
    : 0;
  const todayRecord = recordsByDate.get(dateKey(normalizedToday));

  return {
    hasEnoughRoutineData,
    weeklyProgress,
    completedToday: todayRecord?.status === "done",
    streak: calculateStreak(habit, records, normalizedToday),
    weekDays: weekDates.map((date) => {
      const isScheduled = scheduledDays.includes(date.getDay());
      const isFuture = startOfDay(date) > normalizedToday;
      const record = recordsByDate.get(dateKey(date));
      const status: HabitWeekDayStatus = !isScheduled || isFuture ? "off" : record?.status ?? "off";

      return { date: dateKey(date), status };
    }),
  };
}

function calculateStreak(habit: Habit, records: RoutineHabitRecord[], today: Date) {
  const scheduledDays = habit.scheduledDays?.length ? habit.scheduledDays : [0, 1, 2, 3, 4, 5, 6];
  const recordsByDate = new Map(
    records
      .filter((record) => record.habitId === habit.id)
      .map((record) => [record.date, record]),
  );
  let streak = 0;
  const cursor = startOfDay(today);

  for (let attempts = 0; attempts < 60; attempts += 1) {
    if (!scheduledDays.includes(cursor.getDay())) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    if (recordsByDate.get(dateKey(cursor))?.status !== "done") break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function isRoutineHabitRecord(value: unknown): value is RoutineHabitRecord {
  if (!value || typeof value !== "object") return false;

  const record = value as Partial<RoutineHabitRecord>;
  return (
    typeof record.habitId === "string" &&
    typeof record.date === "string" &&
    (record.status === "done" || record.status === "partial" || record.status === "low") &&
    typeof record.updatedAt === "string"
  );
}
