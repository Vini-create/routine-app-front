"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ensureRoutineBlockRecords,
  readRoutineBlockRecords,
  removeRoutineBlockRecord,
  routineBlockRecordsStorageKey,
  upsertRoutineBlockRecord,
  writeRoutineBlockRecords,
  type RoutineBlockRecord,
} from "@/lib/routineBlockRecords";

export function useRoutineBlockRecords() {
  const [records, setRecords] = useState<RoutineBlockRecord[]>(readRoutineBlockRecords);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === routineBlockRecordsStorageKey) setRecords(readRoutineBlockRecords());
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const upsertRecord = useCallback((record: RoutineBlockRecord) => {
    setRecords((current) => {
      const next = upsertRoutineBlockRecord(current, record);
      writeRoutineBlockRecords(next);
      return next;
    });
  }, []);

  const ensureRecords = useCallback((defaults: RoutineBlockRecord[]) => {
    setRecords((current) => {
      const next = ensureRoutineBlockRecords(current, defaults);
      if (next !== current) writeRoutineBlockRecords(next);
      return next;
    });
  }, []);

  const removeRecord = useCallback((blockId: string, date: string) => {
    setRecords((current) => {
      const next = removeRoutineBlockRecord(current, blockId, date);
      writeRoutineBlockRecords(next);
      return next;
    });
  }, []);

  return { records, upsertRecord, removeRecord, ensureRecords };
}
