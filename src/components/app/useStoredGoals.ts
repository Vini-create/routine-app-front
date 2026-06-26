"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readStoredGoals,
  userGoalsStorageKey,
  writeStoredGoals,
  type StoredGoal,
} from "@/lib/userGoals";

export function useStoredGoals() {
  const [storedGoals, setStoredGoals] = useState<StoredGoal[]>(readStoredGoals);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === userGoalsStorageKey) {
        setStoredGoals(readStoredGoals());
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addStoredGoal = useCallback((goal: StoredGoal) => {
    setStoredGoals((current) => {
      const next = [...current, goal];
      writeStoredGoals(next);
      return next;
    });
  }, []);

  return { storedGoals, addStoredGoal };
}
