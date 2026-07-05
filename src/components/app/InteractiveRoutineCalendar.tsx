"use client";

import type { AgendaEntry, CalendarItemMarker } from "@/lib/agenda";
import type { ItemType } from "@/lib/api-contracts";
import { toDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { permanentMarker } from "@/lib/fonts";

function calendarDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const slots = Math.ceil((first.getDay() + last.getDate()) / 7) * 7;
  return Array.from({ length: slots }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index - first.getDay() + 1));
}

type CalendarMarkerType = Extract<ItemType, "event" | "reminder">;

const itemTypeDot: Record<CalendarMarkerType, string> = {
  event: "bg-sky-400",
  reminder: "bg-amber-400",
};

function isCalendarMarkerType(type: ItemType): type is CalendarMarkerType {
  return type === "event" || type === "reminder";
}

export function InteractiveRoutineCalendar({
  selectedDate,
  visibleMonth,
  entries,
  markers = [],
  months,
  weekdays,
  title,
  itemTypeLabels,
  correctionWindowStart,
  correctionWindowHint,
  onSelectDate,
  onMonthChange,
}: {
  selectedDate: string;
  visibleMonth: Date;
  entries: AgendaEntry[];
  markers?: CalendarItemMarker[];
  months: readonly string[];
  weekdays: readonly string[];
  title: string;
  itemTypeLabels: Readonly<Record<CalendarMarkerType, string>>;
  correctionWindowStart?: string;
  correctionWindowHint?: string;
  onSelectDate: (date: string) => void;
  onMonthChange: (month: Date) => void;
}) {
  const today = toDateKey(new Date());
  const entriesByDate = new Map<string, AgendaEntry[]>();
  entries.forEach((entry) => entriesByDate.set(entry.date, [...(entriesByDate.get(entry.date) ?? []), entry]));
  const markersByDate = new Map<string, CalendarItemMarker[]>();
  markers.forEach((marker) => markersByDate.set(marker.date, [...(markersByDate.get(marker.date) ?? []), marker]));

  return (
    <Card className="grid min-w-0 gap-6 overflow-hidden p-6 sm:p-8">
      <div className="flex min-w-0 items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <p className="break-words text-sm font-black capitalize text-[var(--text-tertiary)] sm:text-base">{months[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}</p>
          <h2 className="mt-1 break-words text-2xl font-black tracking-tight [overflow-wrap:anywhere] sm:text-3xl">{title}</h2>
        </div>
        <div className="flex shrink-0 gap-2 sm:gap-3">
          <Button aria-label="Mês anterior" variant="secondary" className="size-12 min-h-0 rounded-full p-0 text-xl sm:size-14" onClick={() => onMonthChange(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}>‹</Button>
          <Button aria-label="Próximo mês" variant="secondary" className="size-12 min-h-0 rounded-full p-0 text-xl sm:size-14" onClick={() => onMonthChange(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}>›</Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-black text-[var(--text-tertiary)] sm:text-sm">
        {weekdays.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays(visibleMonth).map((date) => {
          const key = toDateKey(date);
          const inMonth = date.getMonth() === visibleMonth.getMonth();
          const selected = key === selectedDate;
          const current = key === today;
          const past = key < today;
          const withinCorrectionWindow = past && Boolean(correctionWindowStart) && key >= correctionWindowStart!;
          const dayEntries = entriesByDate.get(key) ?? [];
          const dayItemTypes = Array.from(new Set([
            ...dayEntries.map((entry) => entry.itemType).filter(isCalendarMarkerType),
            ...(markersByDate.get(key) ?? []).map((marker) => marker.itemType),
          ]));
          return (
            <button
              key={key}
              type="button"
              aria-label={`${key}, ${dayEntries.length} itens`}
              aria-pressed={selected}
              disabled={!inMonth}
              onClick={() => onSelectDate(key)}
              className={cn(
                "group relative grid aspect-square place-items-center rounded-2xl border text-sm font-black transition sm:text-base",
                !inMonth && "cursor-default border-transparent bg-transparent opacity-20",
                inMonth && (current
                  ? "border-[var(--silver-02)] bg-[linear-gradient(112deg,var(--silver-01),var(--silver-03)_48%,var(--silver-04))] text-[#050507] shadow-[0_10px_24px_rgba(0,0,0,0.22),inset_0_1px_1px_rgba(255,255,255,0.52)]"
                  : selected
                    ? "border-[var(--silver-02)] bg-[var(--text-primary)] text-[var(--background-primary)]"
                    : past
                      ? "border-red-500/25 bg-red-500/[0.04] text-[var(--text-tertiary)] hover:border-red-500/45 hover:bg-red-500/[0.08]"
                      : "border-[var(--border-soft)] bg-[var(--surface-ambient)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-standard)]"),
                inMonth && withinCorrectionWindow && "ring-1 ring-inset ring-red-400/70",
              )}
            >
              <span className="relative z-10">{date.getDate()}</span>
              {past && inMonth ? <span aria-hidden="true" className={cn(permanentMarker.className, "pointer-events-none absolute inset-0 z-20 flex -rotate-3 scale-x-110 translate-y-px items-center justify-center text-[3.4rem] font-normal leading-none text-red-500 opacity-35 sm:text-[5rem]")} style={permanentMarker.style}>X</span> : null}
              {dayItemTypes.length ? <span className="absolute bottom-1.5 z-30 flex max-w-[80%] gap-0.5">{dayItemTypes.map((type) => <i key={type} className={cn("size-1.5 rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.12)]", itemTypeDot[type])} />)}</span> : null}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-[var(--text-tertiary)]" aria-label="Legenda dos tipos de item">
        {(Object.keys(itemTypeDot) as CalendarMarkerType[]).map((type) => (
          <span key={type} className="inline-flex items-center gap-1.5">
            <i aria-hidden="true" className={cn("size-2 rounded-full", itemTypeDot[type])} />
            {itemTypeLabels[type]}
          </span>
        ))}
      </div>
      {correctionWindowHint ? <p className="flex min-w-0 items-start gap-2 break-words text-xs font-bold text-[var(--text-tertiary)]"><span aria-hidden="true" className="mt-0.5 size-2.5 shrink-0 rounded-full border border-red-400/80 ring-1 ring-red-400/25" />{correctionWindowHint}</p> : null}
    </Card>
  );
}
