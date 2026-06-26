"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readRoutineHabitRecords,
  removeRoutineHabitRecord,
  routineHabitRecordsStorageKey,
  upsertRoutineHabitRecord,
  writeRoutineHabitRecords,
  type RoutineHabitRecord,
} from "@/lib/routineHabitRecords";

export function useRoutineHabitRecords() {
  const [records, setRecords] = useState<RoutineHabitRecord[]>(readRoutineHabitRecords);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === routineHabitRecordsStorageKey) {
        setRecords(readRoutineHabitRecords());
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const upsertRecord = useCallback((record: RoutineHabitRecord) => {
    setRecords((current) => {
      const next = upsertRoutineHabitRecord(current, record);
      writeRoutineHabitRecords(next);
      return next;
    });
  }, []);

  const removeRecord = useCallback((habitId: string, date: string) => {
    setRecords((current) => {
      const next = removeRoutineHabitRecord(current, habitId, date);
      writeRoutineHabitRecords(next);
      return next;
    });
  }, []);

  const ensureRecords = useCallback((defaults: RoutineHabitRecord[]) => {
    setRecords((current) => {
      const existingKeys = new Set(current.map((record) => `${record.date}:${record.habitId}`));
      const missing = defaults.filter((record) => !existingKeys.has(`${record.date}:${record.habitId}`));
      if (!missing.length) return current;

      const next = [...current, ...missing];
      writeRoutineHabitRecords(next);
      return next;
    });
  }, []);

  return { records, upsertRecord, removeRecord, ensureRecords };
}
