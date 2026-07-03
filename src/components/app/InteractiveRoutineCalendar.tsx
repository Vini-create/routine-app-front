"use client";

import type { AgendaEntry } from "@/lib/agenda";
import { toDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function calendarDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const slots = Math.ceil((first.getDay() + last.getDate()) / 7) * 7;
  return Array.from({ length: slots }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index - first.getDay() + 1));
}

const statusDot = {
  completed: "bg-emerald-400",
  uncompleted: "bg-red-400",
  pending: "bg-[var(--text-tertiary)]",
  vacation: "bg-blue-400",
};

export function InteractiveRoutineCalendar({
  selectedDate,
  visibleMonth,
  entries,
  months,
  weekdays,
  title,
  onSelectDate,
  onMonthChange,
}: {
  selectedDate: string;
  visibleMonth: Date;
  entries: AgendaEntry[];
  months: readonly string[];
  weekdays: readonly string[];
  title: string;
  onSelectDate: (date: string) => void;
  onMonthChange: (month: Date) => void;
}) {
  const today = toDateKey(new Date());
  const entriesByDate = new Map<string, AgendaEntry[]>();
  entries.forEach((entry) => entriesByDate.set(entry.date, [...(entriesByDate.get(entry.date) ?? []), entry]));

  return (
    <Card className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold capitalize text-[var(--text-tertiary)]">{months[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}</p>
          <h2 className="text-xl font-black">{title}</h2>
        </div>
        <div className="flex gap-2">
          <Button aria-label="Mês anterior" variant="secondary" className="min-h-10 px-3" onClick={() => onMonthChange(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}>‹</Button>
          <Button aria-label="Próximo mês" variant="secondary" className="min-h-10 px-3" onClick={() => onMonthChange(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}>›</Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[var(--text-tertiary)]">
        {weekdays.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays(visibleMonth).map((date) => {
          const key = toDateKey(date);
          const inMonth = date.getMonth() === visibleMonth.getMonth();
          const selected = key === selectedDate;
          const current = key === today;
          const dayEntries = entriesByDate.get(key) ?? [];
          return (
            <button
              key={key}
              type="button"
              aria-label={`${key}, ${dayEntries.length} itens`}
              aria-pressed={selected}
              onClick={() => onSelectDate(key)}
              className={cn(
                "relative grid min-h-12 place-items-center rounded-2xl border text-sm font-bold transition sm:min-h-14",
                !inMonth && "opacity-35",
                selected
                  ? "border-[var(--silver-02)] bg-[var(--text-primary)] text-[var(--background-primary)]"
                  : current
                    ? "border-[var(--silver-02)] bg-[linear-gradient(112deg,var(--silver-01),var(--silver-03)_48%,var(--silver-04))] text-[#050507] shadow-soft"
                    : "border-[var(--border-soft)] bg-[var(--surface-ambient)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-standard)]",
              )}
            >
              <span>{date.getDate()}</span>
              {dayEntries.length ? (
                <span className="absolute bottom-1.5 flex max-w-[80%] gap-0.5">
                  {dayEntries.slice(0, 3).map((entry) => <i key={entry.key} className={cn("size-1 rounded-full", statusDot[entry.status])} />)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
