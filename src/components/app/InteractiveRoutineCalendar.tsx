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
    <Card className="grid gap-6 p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black capitalize text-[var(--text-tertiary)] sm:text-base">{months[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
        </div>
        <div className="flex gap-3">
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
          const dayEntries = entriesByDate.get(key) ?? [];
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
              )}
            >
              <span className="relative z-10">{date.getDate()}</span>
              {past && inMonth ? <span aria-hidden="true" className="font-calendar-x pointer-events-none absolute inset-0 z-20 flex translate-y-px items-center justify-center text-[3.4rem] leading-none text-red-500 opacity-35 sm:text-[5rem]">X</span> : null}
              {current ? <span className="absolute bottom-1.5 z-30 size-1.5 rounded-full bg-[#050507]" /> : dayEntries.length ? <span className="absolute bottom-1.5 z-30 flex max-w-[80%] gap-0.5">{dayEntries.slice(0, 3).map((entry) => <i key={entry.key} className={cn("size-1.5 rounded-full", past ? "bg-red-500/75" : statusDot[entry.status])} />)}</span> : null}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
