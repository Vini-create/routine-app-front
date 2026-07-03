import type { Agenda, ItemStatus } from "./api-contracts";
import { formatTime } from "./date";

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
  goalTitle?: string;
};

export function agendaEntries(agenda?: Agenda): AgendaEntry[] {
  if (!agenda) return [];
  return [
    ...agenda.routine_items.map((occurrence): AgendaEntry => ({
      key: `item-${occurrence.item.id}-${occurrence.occurrence_date}`,
      source: "item", sourceId: occurrence.item.id, title: occurrence.item.title,
      description: occurrence.item.description ?? "", time: formatTime(occurrence.occurrence_at),
      durationMinutes: occurrence.item.duration_minutes, date: occurrence.occurrence_date, status: occurrence.status,
    })),
    ...agenda.habits.map((occurrence): AgendaEntry => ({
      key: `habit-${occurrence.habit.id}-${occurrence.occurrence_date}`,
      source: "habit", sourceId: occurrence.habit.id, title: occurrence.habit.name,
      description: occurrence.habit.description ?? "", time: "08:00",
      durationMinutes: occurrence.habit.duration_minutes, date: occurrence.occurrence_date,
      status: occurrence.status, goalTitle: occurrence.goal?.title,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}
