import type { Agenda, ItemStatus, ItemType, RoutineItem } from "./api-contracts";
import { addDays, formatTime, fromDateKey, toDateKey } from "./date";
import { parseRRule } from "./rrule";

export type AgendaEntry = {
  key: string;
  source: "item" | "habit";
  sourceId: string;
  title: string;
  description: string;
  time: string;
  durationMinutes: number;
  date: string;
  status: ItemStatus;
  itemType: ItemType;
  goalTitle?: string;
};

export type CalendarItemMarker = {
  key: string;
  date: string;
  itemType: Extract<ItemType, "event" | "reminder">;
};

export function routineItemCalendarMarkers(items: RoutineItem[] | undefined, start: string, end: string): CalendarItemMarker[] {
  if (!items?.length) return [];
  const markers: CalendarItemMarker[] = [];

  for (const item of items) {
    if (item.item_type !== "event" && item.item_type !== "reminder") continue;
    const itemStart = toDateKey(new Date(item.start_at));
    const itemEnd = item.end_at ? toDateKey(new Date(item.end_at)) : itemStart;
    const rangeStart = itemStart > start ? itemStart : start;
    const rangeEnd = itemEnd < end ? itemEnd : end;
    if (rangeStart > rangeEnd) continue;

    const recurrence = item.schedule_type === "recurring" && item.recurrence_rule
      ? parseRRule(item.recurrence_rule)
      : null;

    for (let date = fromDateKey(rangeStart); toDateKey(date) <= rangeEnd; date = addDays(date, 1)) {
      const dateKey = toDateKey(date);
      const startDate = fromDateKey(itemStart);
      const occurs = !recurrence
        ? dateKey === itemStart
        : recurrence.frequency === "daily"
          || (recurrence.frequency === "weekly" && recurrence.selected.includes(date.getDay()))
          || (recurrence.frequency === "monthly" && recurrence.selected.includes(date.getDate()))
          || (recurrence.frequency === "yearly" && date.getMonth() === startDate.getMonth() && date.getDate() === startDate.getDate());
      if (occurs) markers.push({ key: `${item.id}-${dateKey}`, date: dateKey, itemType: item.item_type });
    }
  }

  return markers;
}

export function agendaEntries(agenda?: Agenda, habitPreferredTimes: Record<string, string> = {}): AgendaEntry[] {
  if (!agenda) return [];
  return [
    ...agenda.routine_items.map((occurrence): AgendaEntry => ({
      key: `item-${occurrence.item.id}-${occurrence.occurrence_date}`,
      source: "item", sourceId: occurrence.item.id, title: occurrence.item.title,
      description: occurrence.item.description ?? "", time: formatTime(occurrence.occurrence_at),
      durationMinutes: occurrence.item.duration_minutes, date: occurrence.occurrence_date, status: occurrence.status,
      itemType: occurrence.item.item_type,
    })),
    ...agenda.habits.map((occurrence): AgendaEntry => ({
      key: `habit-${occurrence.habit.id}-${occurrence.occurrence_date}`,
      source: "habit", sourceId: occurrence.habit.id, title: occurrence.habit.name,
      description: occurrence.habit.description ?? "", time: habitPreferredTimes[occurrence.habit.id] ?? "08:00",
      durationMinutes: occurrence.habit.duration_minutes, date: occurrence.occurrence_date,
      status: occurrence.status, itemType: "habit", goalTitle: occurrence.goal?.title,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}
