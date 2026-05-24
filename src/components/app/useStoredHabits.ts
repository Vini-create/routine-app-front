"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readStoredHabits,
  userHabitsStorageKey,
  writeStoredHabits,
  type StoredHabit,
} from "@/lib/userHabits";

export function useStoredHabits() {
  const [storedHabits, setStoredHabits] = useState<StoredHabit[]>(readStoredHabits);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === userHabitsStorageKey) {
        setStoredHabits(readStoredHabits());
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addStoredHabit = useCallback((habit: StoredHabit) => {
    setStoredHabits((current) => {
      const next = [...current, habit];
      writeStoredHabits(next);
      return next;
    });
  }, []);

  return { storedHabits, addStoredHabit };
}
