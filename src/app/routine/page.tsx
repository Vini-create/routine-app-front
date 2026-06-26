"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { useLanguage, useTranslations } from "@/components/app/LanguageProvider";
import { RoutineCard } from "@/components/app/RoutineCard";
import { useRoutineBlockRecords } from "@/components/app/useRoutineBlockRecords";
import { useRoutineHabitRecords } from "@/components/app/useRoutineHabitRecords";
import { SectionTitle } from "@/components/app/SectionTitle";
import { useAppData } from "@/components/app/useAppData";
import { useStoredGoals } from "@/components/app/useStoredGoals";
import { useStoredHabits } from "@/components/app/useStoredHabits";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/Form";
import {
  readDefaultRoutineSettings,
  writeDefaultRoutineSettings,
  type DefaultRoutineItem,
  type DefaultRoutineSettings,
} from "@/lib/defaultRoutine";
import { getRoutineBlockSourceId, type RoutineBlockRecord } from "@/lib/routineBlockRecords";
import { isHabitScheduledForDate, type RoutineHabitRecord } from "@/lib/routineHabitRecords";
import { cn } from "@/lib/utils";
import type { Habit, RoutineBlock, RoutineStatus } from "@/types";

type ViewMode = "today" | "tomorrow" | "week";
type DefaultRoutineRecurrenceType = "weekly" | "monthly";
type EditableRoutineBlock = RoutineBlock & { previousStatus?: RoutineStatus };
type RoutineByDate = Record<string, EditableRoutineBlock[]>;

const filters: ViewMode[] = ["today", "tomorrow", "week"];
const editableHistoryDays = 7;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(date: Date, locale: string) {
  return date.toLocaleDateString(locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function getBlockMinute(block: RoutineBlock) {
  const [hours, minutes] = block.time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getHabitTime(habit: Habit) {
  return /^\d{2}:\d{2}$/.test(habit.preferredTime) ? habit.preferredTime : "08:00";
}

function createBlocksForDate(date: Date, sourceBlocks: RoutineBlock[]): EditableRoutineBlock[] {
  return sourceBlocks.map((block) => ({
    ...block,
    id: `${dateKey(date)}-${block.id}`,
    status: block.status,
  }));
}

function createHabitBlocksForDate(date: Date, habits: Habit[]): RoutineBlock[] {
  return habits
    .filter((habit) => {
      if (!isHabitScheduledForDate(habit, date)) return false;
      if (!habit.createdAt) return true;
      return startOfDay(date) >= startOfDay(new Date(habit.createdAt));
    })
    .map((habit) => ({
      id: `habit-${habit.id}`,
      habitId: habit.id,
      goalId: habit.goalId,
      goalTitle: habit.goalTitle,
      time: getHabitTime(habit),
      title: habit.name,
      description: habit.reason || habit.category,
      category: "saude",
      duration: "20 min",
      status: "pending",
      energy: habit.difficulty === "alta" ? "alta" : habit.difficulty === "baixa" ? "baixa" : "media",
    }));
}

function isDateInVacation(date: Date, vacation: DefaultRoutineSettings["vacation"]) {
  if (!vacation?.start || !vacation.end) return false;
  const key = dateKey(date);
  return key >= vacation.start && key <= vacation.end;
}

function isDefaultRoutineItemArchived(date: Date, item: DefaultRoutineItem, vacation: DefaultRoutineSettings["vacation"]) {
  if (!isDateInVacation(date, vacation)) return false;
  if (!vacation?.itemIds?.length) return true;
  return vacation.itemIds.includes(item.id);
}

function isDefaultRoutineItemScheduledForDate(item: DefaultRoutineItem, date: Date) {
  if (item.recurrenceType === "monthly") {
    const monthlyDays = item.monthlyDays?.length ? item.monthlyDays : [1];
    return monthlyDays.includes(date.getDate());
  }

  return item.scheduledDays.includes(date.getDay());
}

function createDefaultRoutineBlocksForDate(date: Date, settings: DefaultRoutineSettings): RoutineBlock[] {
  return settings.items
    .filter((item) => isDefaultRoutineItemScheduledForDate(item, date))
    .filter((item) => !isDefaultRoutineItemArchived(date, item, settings.vacation))
    .map((item) => ({
      id: `default-${item.id}`,
      time: item.time,
      title: item.title,
      description: item.description,
      category: item.category,
      duration: item.duration,
      status: "pending",
      energy: item.energy,
    }));
}

function buildDefaultBlocksForDate(
  date: Date,
  sourceRoutineBlocks: RoutineBlock[],
  settings: DefaultRoutineSettings,
  habits: Habit[],
) {
  const sourceBlocks = [
    ...sourceRoutineBlocks,
    ...createDefaultRoutineBlocksForDate(date, settings),
    ...createHabitBlocksForDate(date, habits),
  ];

  return createBlocksForDate(date, sourceBlocks).sort((a, b) => a.time.localeCompare(b.time));
}

function mergeScheduledBlocksForDate(
  date: Date,
  sourceBlocks: EditableRoutineBlock[],
  settings: DefaultRoutineSettings,
  habits: Habit[],
) {
  const key = dateKey(date);
  const existingSourceIds = new Set(sourceBlocks.map((block) => getRoutineBlockSourceId(block.id, key)));
  const scheduledBlocks = [
    ...createDefaultRoutineBlocksForDate(date, settings),
    ...createHabitBlocksForDate(date, habits),
  ]
    .filter((block) => !existingSourceIds.has(block.id))
    .map((block) => ({ ...block, id: `${key}-${block.id}` }));

  return [...sourceBlocks, ...scheduledBlocks].sort((a, b) => a.time.localeCompare(b.time));
}

function getWeekDays(date: Date) {
  const selected = startOfDay(date);
  const mondayOffset = selected.getDay() === 0 ? -6 : 1 - selected.getDay();
  const monday = addDays(selected, mondayOffset);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

function getCalendarDays(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const leading = firstDay.getDay();
  const totalSlots = Math.ceil((leading + lastDay.getDate()) / 7) * 7;

  return Array.from({ length: totalSlots }, (_, index) => {
    const dayNumber = index - leading + 1;
    return new Date(date.getFullYear(), date.getMonth(), dayNumber);
  });
}

function normalizeForm(formData: FormData, fallback?: RoutineBlock): RoutineBlock {
  return {
    id: fallback?.id ?? crypto.randomUUID(),
    time: String(formData.get("time") || "09:00"),
    title: String(formData.get("title") || fallback?.title || ""),
    description: String(formData.get("description") || fallback?.description || ""),
    category: (formData.get("category") as RoutineBlock["category"]) || "foco",
    duration: String(formData.get("duration") || "30 min"),
    status: ((formData.get("status") as RoutineStatus) || fallback?.status || "pending"),
    energy: (formData.get("energy") as RoutineBlock["energy"]) || "media",
    habitId: fallback?.habitId,
    goalId: fallback?.goalId,
    goalTitle: fallback?.goalTitle,
  };
}

export default function RoutinePage() {
  const [today, setToday] = useState(() => startOfDay(new Date()));
  const routine = useTranslations("routine");
  const routineCard = useTranslations("routineCard");
  const common = useTranslations("common");
  const { language } = useLanguage();
  const { habits: initialHabits, routineBlocks } = useAppData();
  const { storedGoals } = useStoredGoals();
  const { storedHabits } = useStoredHabits();
  const {
    records: habitRecords,
    upsertRecord,
    removeRecord,
    ensureRecords: ensureHabitRecords,
  } = useRoutineHabitRecords();
  const {
    records: blockRecords,
    upsertRecord: upsertBlockRecord,
    removeRecord: removeBlockRecord,
    ensureRecords: ensureBlockRecords,
  } = useRoutineBlockRecords();
  const goalTitleById = useMemo(() => new Map(storedGoals.map((goal) => [goal.id, goal.title])), [storedGoals]);
  const scheduledHabits = useMemo(() => {
    return [...initialHabits, ...storedHabits].map((habit) => ({
      ...habit,
      goalTitle: habit.goalTitle ?? (habit.goalId ? goalTitleById.get(habit.goalId) : undefined),
    }));
  }, [goalTitleById, initialHabits, storedHabits]);
  const [defaultRoutineSettings, setDefaultRoutineSettings] = useState<DefaultRoutineSettings>(readDefaultRoutineSettings);
  const [activeFilter, setActiveFilter] = useState<ViewMode>("today");
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [routines, setRoutines] = useState<RoutineByDate>(() => ({
    [dateKey(today)]: createBlocksForDate(today, routineBlocks),
    [dateKey(addDays(today, 1))]: createBlocksForDate(addDays(today, 1), routineBlocks),
  }));
  const [editingBlock, setEditingBlock] = useState<RoutineBlock | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultRoutineRecurrenceType, setDefaultRoutineRecurrenceType] = useState<DefaultRoutineRecurrenceType>("weekly");

  const selectedKey = dateKey(selectedDate);
  const earliestEditableDate = addDays(today, -editableHistoryDays);
  const blockRecordsByKey = useMemo(
    () => new Map(blockRecords.map((record) => [`${record.date}:${record.blockId}`, record])),
    [blockRecords],
  );

  function localizeBlocks(sourceBlocks: EditableRoutineBlock[]) {
    return sourceBlocks.map((block) => {
      const baseId = block.id.split("-").at(-1);
      const translatedBlock = routineBlocks.find((item) => item.id === baseId);

      if (!translatedBlock) return block;

      return {
        ...block,
        title: translatedBlock.title,
        description: translatedBlock.description,
      };
    });
  }

  function getDefaultBlocksForDate(date: Date) {
    return buildDefaultBlocksForDate(date, routineBlocks, defaultRoutineSettings, scheduledHabits);
  }

  function withScheduledBlocks(date: Date, sourceBlocks: EditableRoutineBlock[]) {
    return mergeScheduledBlocksForDate(date, sourceBlocks, defaultRoutineSettings, scheduledHabits);
  }

  function applyRecordedStatuses(date: Date, sourceBlocks: EditableRoutineBlock[]) {
    const key = dateKey(date);
    return sourceBlocks.map((block) => {
      const sourceId = getRoutineBlockSourceId(block.id, key);
      const record = blockRecordsByKey.get(`${key}:${sourceId}`);
      if (!record) return block;

      return {
        ...block,
        status: record.status === "done" ? "done" as const : "missed" as const,
      };
    });
  }

  const blocks = applyRecordedStatuses(
    selectedDate,
    localizeBlocks(withScheduledBlocks(selectedDate, routines[selectedKey] ?? getDefaultBlocksForDate(selectedDate))),
  );
  const calendarDays = getCalendarDays(visibleMonth);
  const weekDays = getWeekDays(selectedDate);

  function ensureDay(date: Date) {
    const key = dateKey(date);
    setRoutines((current) => (current[key] ? current : { ...current, [key]: getDefaultBlocksForDate(date) }));
  }

  const [currentMinute, setCurrentMinute] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = new Date();
      setCurrentMinute(now.getHours() * 60 + now.getMinutes());
      setToday((current) => dateKey(current) === dateKey(now) ? current : startOfDay(now));
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const automaticBlockRecords: RoutineBlockRecord[] = [];
    const automaticHabitRecords: RoutineHabitRecord[] = [];
    const updatedAt = new Date().toISOString();
    const existingHabitKeys = new Set(habitRecords.map((record) => `${record.date}:${record.habitId}`));

    for (let offset = 1; offset <= editableHistoryDays; offset += 1) {
      const date = addDays(today, -offset);
      const key = dateKey(date);
      const storedBlocks = routines[key] ?? buildDefaultBlocksForDate(date, routineBlocks, defaultRoutineSettings, scheduledHabits);
      const dayBlocks = mergeScheduledBlocksForDate(date, storedBlocks, defaultRoutineSettings, scheduledHabits);

      dayBlocks.forEach((block) => {
        automaticBlockRecords.push({
          blockId: getRoutineBlockSourceId(block.id, key),
          date: key,
          status: "not_done",
          automatic: true,
          updatedAt,
        });

        if (block.habitId && !existingHabitKeys.has(`${key}:${block.habitId}`)) {
          existingHabitKeys.add(`${key}:${block.habitId}`);
          automaticHabitRecords.push({
            habitId: block.habitId,
            date: key,
            status: "low",
            sourceBlockId: block.id,
            updatedAt,
          });
        }
      });
    }

    ensureBlockRecords(automaticBlockRecords);
    ensureHabitRecords(automaticHabitRecords);
  }, [
    defaultRoutineSettings,
    ensureBlockRecords,
    ensureHabitRecords,
    habitRecords,
    routineBlocks,
    routines,
    scheduledHabits,
    today,
  ]);

  function openDate(date: Date, mode: ViewMode = "today") {
    if (startOfDay(date) < earliestEditableDate) return;
    ensureDay(date);
    setSelectedDate(startOfDay(date));
    setActiveFilter(mode);
  }

  function chooseFilter(filter: ViewMode) {
    setActiveFilter(filter);
    if (filter === "today") openDate(today, "today");
    if (filter === "tomorrow") openDate(addDays(today, 1), "tomorrow");
  }

  function isCurrentBlock(block: RoutineBlock, index: number) {
    if (selectedKey !== dateKey(today)) return false;
    const start = getBlockMinute(block);
    const nextBlock = blocks[index + 1];
    const end = nextBlock ? getBlockMinute(nextBlock) : 24 * 60;
    return currentMinute >= start && currentMinute < end;
  }

  function updateBlock(id: string, patch: Partial<RoutineBlock>) {
    setRoutines((current) => ({
      ...current,
      [selectedKey]: blocks.map((block) => (block.id === id ? { ...block, ...patch } : block)),
    }));
  }

  function persistBlockStatus(block: RoutineBlock, status: RoutineBlockRecord["status"]) {
    upsertBlockRecord({
      blockId: getRoutineBlockSourceId(block.id, selectedKey),
      date: selectedKey,
      status,
      automatic: false,
      updatedAt: new Date().toISOString(),
    });
  }

  function toggleDone(id: string) {
    const targetBlock = blocks.find((block) => block.id === id);
    if (!targetBlock) return;

    const isUndoing = targetBlock.status === "done";
    const isPastDate = selectedDate < today;

    if (isUndoing) {
      if (isPastDate) persistBlockStatus(targetBlock, "not_done");
      else removeBlockRecord(getRoutineBlockSourceId(targetBlock.id, selectedKey), selectedKey);
    } else {
      persistBlockStatus(targetBlock, "done");
    }

    if (targetBlock.habitId) {
      if (isUndoing) {
        if (isPastDate) {
          upsertRecord({
            habitId: targetBlock.habitId,
            date: selectedKey,
            status: "low",
            sourceBlockId: targetBlock.id,
            updatedAt: new Date().toISOString(),
          });
        } else {
          removeRecord(targetBlock.habitId, selectedKey);
        }
      } else {
        upsertRecord({
          habitId: targetBlock.habitId,
          date: selectedKey,
          status: "done",
          sourceBlockId: targetBlock.id,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    setRoutines((current) => ({
      ...current,
      [selectedKey]: blocks.map((block) => {
        if (block.id !== id) return block;

        if (block.status === "done") {
          return {
            ...block,
            status: block.previousStatus ?? "pending",
            previousStatus: undefined,
          };
        }

        return {
          ...block,
          previousStatus: block.status,
          status: "done",
        };
      }),
    }));
  }

  function skipBlock(id: string) {
    const targetBlock = blocks.find((block) => block.id === id);
    if (!targetBlock) return;

    persistBlockStatus(targetBlock, "not_done");

    if (targetBlock.habitId) {
      upsertRecord({
        habitId: targetBlock.habitId,
        date: selectedKey,
        status: "low",
        sourceBlockId: targetBlock.id,
        updatedAt: new Date().toISOString(),
      });
    }

    updateBlock(id, { status: "skipped" });
  }

  function syncHabitRecordFromBlock(block: RoutineBlock) {
    if (block.status === "done" || block.status === "skipped" || block.status === "missed") {
      persistBlockStatus(block, block.status === "done" ? "done" : "not_done");
    } else {
      removeBlockRecord(getRoutineBlockSourceId(block.id, selectedKey), selectedKey);
    }

    if (!block.habitId) return;

    if (block.status === "done" || block.status === "skipped" || block.status === "missed") {
      upsertRecord({
        habitId: block.habitId,
        date: selectedKey,
        status: block.status === "done" ? "done" : "low",
        sourceBlockId: block.id,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    removeRecord(block.habitId, selectedKey);
  }

  function deleteBlock(id: string) {
    const targetBlock = blocks.find((block) => block.id === id);
    if (targetBlock) {
      removeBlockRecord(getRoutineBlockSourceId(targetBlock.id, selectedKey), selectedKey);
      if (targetBlock.habitId) removeRecord(targetBlock.habitId, selectedKey);
    }

    setRoutines((current) => ({
      ...current,
      [selectedKey]: blocks.filter((block) => block.id !== id),
    }));
  }

  function openEditor(block?: RoutineBlock) {
    setEditingBlock(block ?? null);
    setModalOpen(true);
  }

  function saveBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const block = normalizeForm(formData, editingBlock ?? undefined);
    block.title ||= routine.defaultTitle;
    block.description ||= routine.defaultDescription;
    syncHabitRecordFromBlock(block);

    setRoutines((current) => {
      const currentBlocks = current[selectedKey] ?? getDefaultBlocksForDate(selectedDate);
      const nextBlocks = editingBlock
        ? currentBlocks.map((item) => (item.id === editingBlock.id ? block : item))
        : [...currentBlocks, { ...block, id: `${selectedKey}-${block.id}` }];

      return {
        ...current,
        [selectedKey]: nextBlocks.sort((a, b) => a.time.localeCompare(b.time)),
      };
    });
    setModalOpen(false);
  }

  function persistDefaultRoutineSettings(nextSettings: DefaultRoutineSettings) {
    setDefaultRoutineSettings(nextSettings);
    writeDefaultRoutineSettings(nextSettings);
  }

  function saveDefaultRoutineItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const scheduledDays = formData.getAll("defaultScheduledDays").map(Number);
    const monthlyDays = formData.getAll("defaultMonthlyDays").map(Number);
    const recurrenceType = (formData.get("defaultRecurrenceType") as DefaultRoutineRecurrenceType) || "weekly";
    const item: DefaultRoutineItem = {
      id: crypto.randomUUID(),
      title: String(formData.get("defaultTitle") || routine.defaultRoutineFallbackTitle),
      description: String(formData.get("defaultDescription") || routine.defaultRoutineFallbackDescription),
      time: String(formData.get("defaultTime") || "08:00"),
      duration: String(formData.get("defaultDuration") || "1 h"),
      category: (formData.get("defaultCategory") as RoutineBlock["category"]) || "trabalho",
      energy: (formData.get("defaultEnergy") as RoutineBlock["energy"]) || "media",
      recurrenceType,
      scheduledDays: recurrenceType === "weekly" ? (scheduledDays.length ? scheduledDays : [1, 2, 3, 4, 5]) : [],
      monthlyDays: recurrenceType === "monthly" ? (monthlyDays.length ? monthlyDays : [1]) : [],
    };

    persistDefaultRoutineSettings({
      ...defaultRoutineSettings,
      items: [...defaultRoutineSettings.items, item],
    });
    event.currentTarget.reset();
    setDefaultRoutineRecurrenceType("weekly");
  }

  function removeDefaultRoutineItem(id: string) {
    persistDefaultRoutineSettings({
      ...defaultRoutineSettings,
      items: defaultRoutineSettings.items.filter((item) => item.id !== id),
    });
  }

  function saveVacationPeriod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const start = String(formData.get("vacationStart") || "");
    const end = String(formData.get("vacationEnd") || "");
    const itemIds = formData.getAll("vacationItemIds").map(String);

    persistDefaultRoutineSettings({
      ...defaultRoutineSettings,
      vacation: start && end ? { start, end, itemIds } : undefined,
    });
  }

  return (
    <AppShell title={routine.title}>
      <Card className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-zinc-500">
              {routine.months[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
            </p>
            <h2 className="text-xl font-black">{routine.calendar}</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="min-h-10 px-3"
              onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
            >
              ‹
            </Button>
            <Button
              variant="secondary"
              className="min-h-10 px-3"
              onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
            >
              ›
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-zinc-500">
          {routine.weekdays.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const inMonth = day.getMonth() === visibleMonth.getMonth();
            const isPast = startOfDay(day) < today;
            const isLockedPast = startOfDay(day) < earliestEditableDate;
            const isEditablePast = isPast && !isLockedPast;
            const isSelected = dateKey(day) === selectedKey;
            const isToday = dateKey(day) === dateKey(today);
            const dayButtonState = isLockedPast
              ? "cursor-not-allowed border border-[var(--border-soft)] bg-[var(--surface-ambient)] text-[var(--text-tertiary)]"
              : isToday
                ? "border border-[var(--silver-02)] bg-[linear-gradient(112deg,var(--silver-01),var(--silver-03)_48%,var(--silver-04))] text-[#050507] shadow-[0_10px_24px_rgba(0,0,0,0.22),inset_0_1px_1px_rgba(255,255,255,0.52)] hover:text-[#050507]"
                : isSelected
                  ? "border border-[var(--silver-02)] bg-[var(--text-primary)] text-[var(--background-primary)] hover:text-[var(--background-primary)]"
                  : isEditablePast
                    ? "border border-red-500/30 bg-red-500/[0.06] text-[var(--text-secondary)] hover:border-red-500/55 hover:bg-red-500/[0.1] hover:text-[var(--text-primary)]"
                  : "border border-[var(--border-soft)] bg-[var(--surface-ambient)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-standard)] hover:text-[var(--text-primary)]";
            const dayNumberState = isToday
              ? "text-[#050507]"
              : isSelected
                ? "text-[var(--background-primary)]"
                : isLockedPast
                  ? "text-[var(--text-tertiary)]"
                  : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]";

            return (
              <button
                key={dateKey(day)}
                type="button"
                disabled={!inMonth || isLockedPast}
                onClick={() => openDate(day, "today")}
                className={cn(
                  "group relative grid aspect-square place-items-center rounded-2xl text-sm font-bold transition",
                  !inMonth && "opacity-20",
                  inMonth && dayButtonState,
                )}
              >
                <span className={cn("relative z-10", dayNumberState)}>
                  {day.getDate()}
                </span>
                {isPast && inMonth ? (
                  <span className={cn(
                    "font-calendar-x pointer-events-none absolute inset-0 z-20 flex translate-y-[1px] items-center justify-center text-[5.25rem] leading-none text-red-500",
                    isEditablePast ? "opacity-[0.35]" : "opacity-25",
                  )}>
                    X
                  </span>
                ) : null}
                {isToday ? <span className="absolute bottom-1 size-1.5 rounded-full bg-[#050507]" /> : null}
                {isEditablePast && !isSelected ? <span className="absolute bottom-1 size-1.5 rounded-full bg-red-500/70" /> : null}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        {filters.map((filter, index) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "primary" : "secondary"}
            onClick={() => chooseFilter(filter)}
            className="px-3"
          >
            {routine.filters[index]}
          </Button>
        ))}
      </div>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <SectionTitle
            title={activeFilter === "week" ? routine.weeklyAgenda : `${routine.timeline} · ${formatDisplayDate(selectedDate, language)}`}
            description={routine.description}
          />
          <Button className="shrink-0" onClick={() => openEditor()}>
            {routine.newBlock}
          </Button>
        </div>
      </Card>

      {activeFilter === "week" ? (
        <div className="grid gap-4">
          {weekDays.map((day) => {
            const key = dateKey(day);
            const dayBlocks = applyRecordedStatuses(
              day,
              localizeBlocks(withScheduledBlocks(day, routines[key] ?? getDefaultBlocksForDate(day))),
            );
            const isLockedPast = startOfDay(day) < earliestEditableDate;
            return (
              <Card key={key} className={cn(isLockedPast && "opacity-60")}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge tone={dateKey(day) === selectedKey ? "green" : "blue"}>
                      {routine.weekdays[day.getDay()]} · {day.toLocaleDateString(language, { day: "2-digit", month: "2-digit" })}
                    </Badge>
                    <h3 className="subtitle-display mt-3 text-xl text-[var(--text-primary)]">
                      {isLockedPast ? routine.dayClosed : dayBlocks[0]?.title ?? routine.openRoutine}
                    </h3>
                  </div>
                  {!isLockedPast ? (
                    <Button variant="secondary" className="shrink-0 px-3" onClick={() => openDate(day, "today")}>
                      {routine.open}
                    </Button>
                  ) : null}
                </div>
                <div className="mt-4 grid gap-2">
                  {dayBlocks.slice(0, 4).map((block) => (
                    <div key={block.id} className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-900">
                      <span className="font-bold text-zinc-500">{block.time}</span>
                      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
                        {block.habitId ? (
                          <>
                            <Badge tone="neutral">{common.habit}</Badge>
                            <Badge tone="blue">{block.goalTitle ?? common.unlinkedGoal}</Badge>
                          </>
                        ) : null}
                        <span className="subtitle-display text-base text-[var(--text-primary)]">{block.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4">
          {blocks.map((block, index) => (
            <RoutineCard
              key={block.id}
              block={block}
              isCurrent={isCurrentBlock(block, index)}
              onDone={toggleDone}
              onSkip={skipBlock}
              onEdit={openEditor}
              onDelete={deleteBlock}
            />
          ))}
          {!blocks.length ? (
            <EmptyState title={routine.emptyTitle} description={routine.emptyDescription} />
          ) : null}
        </div>
      )}

      <Card className="grid gap-4">
        <SectionTitle title={routine.defaultRoutine} description={routine.defaultRoutineDescription} />
        {defaultRoutineSettings.items.length ? (
          <div className="grid gap-2">
            {defaultRoutineSettings.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-900">
                <div>
                  <p className="subtitle-display text-base text-[var(--text-primary)]">{item.time} · {item.title}</p>
                  <p className="text-xs text-zinc-500">
                    {item.recurrenceType === "monthly"
                      ? `${routine.monthly}: ${(item.monthlyDays?.length ? item.monthlyDays : [1]).join(", ")}`
                      : item.scheduledDays.map((day) => routine.weekdays[day]).join(", ")}
                  </p>
                </div>
                <Button variant="ghost" className="min-h-10 px-3 text-xs" onClick={() => removeDefaultRoutineItem(item.id)}>
                  {routine.remove}
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        <form onSubmit={saveDefaultRoutineItem} className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label={routine.titleField}>
              <Input name="defaultTitle" placeholder={routine.defaultRoutinePlaceholder} required />
            </FieldLabel>
            <FieldLabel label={routine.time}>
              <Input name="defaultTime" type="time" defaultValue="08:00" />
            </FieldLabel>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label={routine.duration}>
              <Input name="defaultDuration" defaultValue="1 h" />
            </FieldLabel>
            <FieldLabel label={routine.category}>
              <Select name="defaultCategory" defaultValue="trabalho">
                <option value="saude">{routine.health}</option>
                <option value="foco">{routine.focus}</option>
                <option value="trabalho">{routine.work}</option>
                <option value="descanso">{routine.rest}</option>
                <option value="reflexao">{routine.reflection}</option>
              </Select>
            </FieldLabel>
          </div>
          <FieldLabel label={routine.descriptionField}>
            <Textarea name="defaultDescription" placeholder={routine.defaultRoutineDescriptionPlaceholder} />
          </FieldLabel>
          <FieldLabel label={routine.recurrence}>
            <Select
              name="defaultRecurrenceType"
              value={defaultRoutineRecurrenceType}
              onChange={(event) => setDefaultRoutineRecurrenceType(event.target.value as DefaultRoutineRecurrenceType)}
            >
              <option value="weekly">{routine.weekly}</option>
              <option value="monthly">{routine.monthly}</option>
            </Select>
          </FieldLabel>
          {defaultRoutineRecurrenceType === "weekly" ? (
            <FieldLabel label={routine.repeatOn}>
              <div className="grid grid-cols-7 gap-1.5">
                {routine.weekdays.map((day, index) => (
                  <label key={day} className="grid min-h-11 place-items-center rounded-2xl bg-zinc-50 text-xs font-bold dark:bg-zinc-900">
                    <input className="peer sr-only" type="checkbox" name="defaultScheduledDays" value={index} defaultChecked={index > 0 && index < 6} />
                    <span className="grid size-full place-items-center rounded-2xl transition peer-checked:bg-zinc-950 peer-checked:text-white dark:peer-checked:bg-white dark:peer-checked:text-zinc-950">
                      {day}
                    </span>
                  </label>
                ))}
              </div>
            </FieldLabel>
          ) : (
            <FieldLabel label={routine.monthDays}>
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                  <label key={day} className="grid min-h-10 place-items-center rounded-2xl bg-zinc-50 text-xs font-bold dark:bg-zinc-900">
                    <input className="peer sr-only" type="checkbox" name="defaultMonthlyDays" value={day} defaultChecked={day === 1} />
                    <span className="grid size-full place-items-center rounded-2xl transition peer-checked:bg-zinc-950 peer-checked:text-white dark:peer-checked:bg-white dark:peer-checked:text-zinc-950">
                      {day}
                    </span>
                  </label>
                ))}
              </div>
            </FieldLabel>
          )}
          <FieldLabel label={routine.energy}>
            <Select name="defaultEnergy" defaultValue="media">
              <option value="baixa">{routine.low}</option>
              <option value="media">{routine.medium}</option>
              <option value="alta">{routine.high}</option>
            </Select>
          </FieldLabel>
          <Button type="submit">{routine.addDefaultRoutineItem}</Button>
        </form>

        <form onSubmit={saveVacationPeriod} className="grid gap-3 rounded-3xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-black">{routine.vacationPeriod}</h3>
          <p className="text-xs leading-5 text-zinc-500">{routine.vacationDescription}</p>
          {defaultRoutineSettings.items.length ? (
            <FieldLabel label={routine.vacationItems}>
              <div className="grid gap-2">
                {defaultRoutineSettings.items.map((item) => (
                  <label key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3 text-sm font-bold dark:bg-zinc-950/70">
                    <span>{item.time} · {item.title}</span>
                    <input
                      className="size-4 accent-[var(--silver-02)]"
                      type="checkbox"
                      name="vacationItemIds"
                      value={item.id}
                      defaultChecked={defaultRoutineSettings.vacation?.itemIds?.includes(item.id) ?? false}
                    />
                  </label>
                ))}
              </div>
            </FieldLabel>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label={routine.startDate}>
              <Input name="vacationStart" type="date" defaultValue={defaultRoutineSettings.vacation?.start ?? ""} />
            </FieldLabel>
            <FieldLabel label={routine.endDate}>
              <Input name="vacationEnd" type="date" defaultValue={defaultRoutineSettings.vacation?.end ?? ""} />
            </FieldLabel>
          </div>
          <Button type="submit" variant="secondary">{routine.saveVacation}</Button>
        </form>
      </Card>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-4">
          <Card className="w-full max-w-xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">{editingBlock ? routine.editBlock : routine.newBlock}</h2>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                {routine.close}
              </Button>
            </div>
            <form onSubmit={saveBlock} className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <FieldLabel label={routine.time}>
                  <Input name="time" type="time" defaultValue={editingBlock?.time ?? "09:00"} />
                </FieldLabel>
                <FieldLabel label={routine.duration}>
                  <Input name="duration" defaultValue={editingBlock?.duration ?? "45 min"} />
                </FieldLabel>
              </div>
              <FieldLabel label={routine.titleField}>
                <Input name="title" defaultValue={editingBlock?.title ?? ""} placeholder={routine.titlePlaceholder} />
              </FieldLabel>
              <FieldLabel label={routine.descriptionField}>
                <Textarea name="description" defaultValue={editingBlock?.description ?? ""} />
              </FieldLabel>
              <div className="grid grid-cols-3 gap-3">
                <FieldLabel label={routine.category}>
                  <Select name="category" defaultValue={editingBlock?.category ?? "foco"}>
                    <option value="saude">{routine.health}</option>
                    <option value="foco">{routine.focus}</option>
                    <option value="trabalho">{routine.work}</option>
                    <option value="descanso">{routine.rest}</option>
                    <option value="reflexao">{routine.reflection}</option>
                  </Select>
                </FieldLabel>
                <FieldLabel label={routine.energy}>
                  <Select name="energy" defaultValue={editingBlock?.energy ?? "media"}>
                    <option value="baixa">{routine.low}</option>
                    <option value="media">{routine.medium}</option>
                    <option value="alta">{routine.high}</option>
                  </Select>
                </FieldLabel>
                <FieldLabel label={routine.status}>
                  <Select name="status" defaultValue={editingBlock?.status ?? "pending"}>
                    <option value="pending">{routineCard.pending}</option>
                    <option value="done">{routineCard.done}</option>
                    <option value="skipped">{routineCard.skipped}</option>
                    <option value="missed">{routineCard.missed}</option>
                  </Select>
                </FieldLabel>
              </div>
              <Button type="submit">{routine.save}</Button>
            </form>
          </Card>
        </div>
      ) : null}
    </AppShell>
  );
}
