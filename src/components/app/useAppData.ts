"use client";

import { useMemo } from "react";
import type { Habit, Insight, RoutineBlock, User, WeeklyPlan } from "@/types";
import { useTranslations } from "./LanguageProvider";

export function useAppData() {
  const labels = useTranslations("appData");

  return useMemo<{
    user: User;
    routineBlocks: RoutineBlock[];
    habits: Habit[];
    insights: Insight[];
    weeklyPlan: WeeklyPlan[];
  }>(() => ({
    // API_CONNECTION_POINT: replace empty initial state with GET /users/me when auth is connected.
    user: {
      id: "",
      name: labels.defaultUserName,
      age: 0,
      occupation: "",
      wakeTime: "",
      sleepTime: "",
      goals: [],
      energyPattern: {
        morning: 0,
        afternoon: 0,
        night: 0,
      },
      aiTone: "neutra",
    },
    // API_CONNECTION_POINT: replace empty arrays with API resources for the authenticated user.
    routineBlocks: [],
    habits: [],
    insights: [],
    weeklyPlan: [],
  }), [labels.defaultUserName]);
}
