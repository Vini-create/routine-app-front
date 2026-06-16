"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { useLanguage, useTranslations } from "@/components/app/LanguageProvider";
import { RoutineCard } from "@/components/app/RoutineCard";
import { useRoutineHabitRecords } from "@/components/app/useRoutineHabitRecords";
import { SectionTitle } from "@/components/app/SectionTitle";
import { useAppData } from "@/components/app/useAppData";
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
import { cn } from "@/lib/utils";
import type { Habit, RoutineBlock, RoutineStatus } from "@/types";

type ViewMode = "today" | "tomorrow" | "week";
type EditableRoutineBlock = RoutineBlock & { previousStatus?: RoutineStatus };
type RoutineByDate = Record<string, EditableRoutineBlock[]>;

const filters: ViewMode[] = ["today", "tomorrow", "week"];

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
    .filter((habit) => habit.scheduledDays?.includes(date.getDay()))
    .map((habit) => ({
      id: `habit-${habit.id}`,
      habitId: habit.id,
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

function createDefaultRoutineBlocksForDate(date: Date, settings: DefaultRoutineSettings): RoutineBlock[] {
  if (isDateInVacation(date, settings.vacation)) return [];

  return settings.items
    .filter((item) => item.scheduledDays.includes(date.getDay()))
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
  };
}

export default function RoutinePage() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const routine = useTranslations("routine");
  const routineCard = useTranslations("routineCard");
  const { language } = useLanguage();
  const { habits: initialHabits, routineBlocks } = useAppData();
  const { storedHabits } = useStoredHabits();
  const { upsertRecord, removeRecord } = useRoutineHabitRecords();
  const scheduledHabits = [...initialHabits, ...storedHabits];
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

  const selectedKey = dateKey(selectedDate);
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
    const sourceBlocks = [
      ...routineBlocks,
      ...createDefaultRoutineBlocksForDate(date, defaultRoutineSettings),
      ...createHabitBlocksForDate(date, scheduledHabits),
    ];
    return createBlocksForDate(date, sourceBlocks).sort((a, b) => a.time.localeCompare(b.time));
  }

  function withScheduledBlocks(date: Date, sourceBlocks: EditableRoutineBlock[]) {
    const key = dateKey(date);
    const existingSourceIds = new Set(sourceBlocks.map((block) => block.id.split(`${key}-`)[1]));
    const scheduledBlocks = [
      ...createDefaultRoutineBlocksForDate(date, defaultRoutineSettings),
      ...createHabitBlocksForDate(date, scheduledHabits),
    ]
      .filter((block) => !existingSourceIds.has(block.id))
      .map((block) => ({
        ...block,
        id: `${key}-${block.id}`,
      }));

    return [...sourceBlocks, ...scheduledBlocks].sort((a, b) => a.time.localeCompare(b.time));
  }

  const blocks = localizeBlocks(withScheduledBlocks(selectedDate, routines[selectedKey] ?? getDefaultBlocksForDate(selectedDate)));
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
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  function openDate(date: Date, mode: ViewMode = "today") {
    if (startOfDay(date) < today) return;
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

  function toggleDone(id: string) {
    const targetBlock = blocks.find((block) => block.id === id);

    if (targetBlock?.habitId) {
      if (targetBlock.status === "done") {
        removeRecord(targetBlock.habitId, selectedKey);
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

    if (targetBlock?.habitId) {
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
    if (!block.habitId) return;

    if (block.status === "done" || block.status === "skipped") {
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
    const item: DefaultRoutineItem = {
      id: crypto.randomUUID(),
      title: String(formData.get("defaultTitle") || routine.defaultRoutineFallbackTitle),
      description: String(formData.get("defaultDescription") || routine.defaultRoutineFallbackDescription),
      time: String(formData.get("defaultTime") || "08:00"),
      duration: String(formData.get("defaultDuration") || "1 h"),
      category: (formData.get("defaultCategory") as RoutineBlock["category"]) || "trabalho",
      energy: (formData.get("defaultEnergy") as RoutineBlock["energy"]) || "media",
      scheduledDays: scheduledDays.length ? scheduledDays : [1, 2, 3, 4, 5],
    };

    persistDefaultRoutineSettings({
      ...defaultRoutineSettings,
      items: [...defaultRoutineSettings.items, item],
    });
    event.currentTarget.reset();
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

    persistDefaultRoutineSettings({
      ...defaultRoutineSettings,
      vacation: start && end ? { start, end } : undefined,
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
            const isSelected = dateKey(day) === selectedKey;
            const isToday = dateKey(day) === dateKey(today);
            const dayButtonState = isPast
              ? "cursor-not-allowed border border-[#2B2B31] bg-[#17171A] text-[#8B847B]"
              : isToday
                ? "border border-[#B87333] bg-[#B87333] text-[#F6F1E8] hover:bg-[#C78A52] hover:text-[#F6F1E8]"
                : isSelected
                  ? "border border-[#D8B08C] bg-[#F6F1E8] text-[#0B0B0D] hover:bg-[#F6F1E8] hover:text-[#0B0B0D]"
                  : "border border-[#2B2B31] bg-[#17171A] text-[#EDE6DA] hover:border-[#B87333]/60 hover:bg-[#B87333]/12 hover:text-[#F6F1E8]";
            const dayNumberState = isToday
              ? "text-[#F6F1E8]"
              : isSelected
                ? "text-[#0B0B0D]"
                : isPast
                  ? "text-[#8B847B]"
                  : "text-[#EDE6DA] group-hover:text-[#F6F1E8]";

            return (
              <button
                key={dateKey(day)}
                type="button"
                disabled={!inMonth || isPast}
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
                  <span className="font-sunshiney pointer-events-none absolute inset-0 z-20 flex translate-y-[1px] items-center justify-center text-[5.25rem] leading-none text-red-500/20">
                    x
                  </span>
                ) : null}
                {isToday ? <span className="absolute bottom-1 size-1.5 rounded-full bg-[#F6F1E8]" /> : null}
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

      <Card className="grid gap-4">
        <SectionTitle title={routine.defaultRoutine} description={routine.defaultRoutineDescription} />
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
          <FieldLabel label={routine.energy}>
            <Select name="defaultEnergy" defaultValue="media">
              <option value="baixa">{routine.low}</option>
              <option value="media">{routine.medium}</option>
              <option value="alta">{routine.high}</option>
            </Select>
          </FieldLabel>
          <Button type="submit">{routine.addDefaultRoutineItem}</Button>
        </form>

        {defaultRoutineSettings.items.length ? (
          <div className="grid gap-2">
            {defaultRoutineSettings.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-900">
                <div>
                  <p className="font-black">{item.time} · {item.title}</p>
                  <p className="text-xs text-zinc-500">{item.scheduledDays.map((day) => routine.weekdays[day]).join(", ")}</p>
                </div>
                <Button variant="ghost" className="min-h-10 px-3 text-xs" onClick={() => removeDefaultRoutineItem(item.id)}>
                  {routine.remove}
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        <form onSubmit={saveVacationPeriod} className="grid gap-3 rounded-3xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-black">{routine.vacationPeriod}</h3>
          <p className="text-xs leading-5 text-zinc-500">{routine.vacationDescription}</p>
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
            const dayBlocks = localizeBlocks(withScheduledBlocks(day, routines[key] ?? getDefaultBlocksForDate(day)));
            const isPast = startOfDay(day) < today;
            return (
              <Card key={key} className={cn(isPast && "opacity-60")}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge tone={dateKey(day) === selectedKey ? "green" : "blue"}>
                      {routine.weekdays[day.getDay()]} · {day.toLocaleDateString(language, { day: "2-digit", month: "2-digit" })}
                    </Badge>
                    <h3 className="mt-3 text-lg font-bold">
                      {isPast ? routine.dayClosed : dayBlocks[0]?.title ?? routine.openRoutine}
                    </h3>
                  </div>
                  {!isPast ? (
                    <Button variant="secondary" className="shrink-0 px-3" onClick={() => openDate(day, "today")}>
                      {routine.open}
                    </Button>
                  ) : null}
                </div>
                <div className="mt-4 grid gap-2">
                  {dayBlocks.slice(0, 4).map((block) => (
                    <div key={block.id} className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-900">
                      <span className="font-bold text-zinc-500">{block.time}</span>
                      <span className="font-semibold">{block.title}</span>
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
