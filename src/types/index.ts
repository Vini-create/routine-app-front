export type RoutineStatus = "pending" | "active" | "done" | "skipped" | "missed";

export type User = {
  id: string;
  name: string;
  age: number;
  occupation: string;
  wakeTime: string;
  sleepTime: string;
  goals: string[];
  energyPattern: {
    morning: number;
    afternoon: number;
    night: number;
  };
  aiTone: "leve" | "neutra" | "direta";
};

export type RoutineBlock = {
  id: string;
  habitId?: string;
  goalId?: string;
  goalTitle?: string;
  time: string;
  title: string;
  description: string;
  category: "saude" | "foco" | "trabalho" | "descanso" | "reflexao";
  duration: string;
  status: RoutineStatus;
  energy: "baixa" | "media" | "alta";
};

export type Habit = {
  id: string;
  goalId?: string;
  goalTitle?: string;
  createdAt?: string;
  name: string;
  category: string;
  frequency: string;
  preferredTime: string;
  recurrenceType?: "weekly" | "monthly";
  scheduledDays?: number[];
  monthlyDays?: number[];
  difficulty: "baixa" | "media" | "alta";
  reason: string;
  streak: number;
  weeklyProgress: number;
  completedToday: boolean;
};

export type Goal = {
  id: string;
  title: string;
  description: string;
  category: "health" | "productivity" | "learning" | "fitness" | "mental_wellness" | "other";
  targetDate: string;
  createdAt: string;
};

export type CheckIn = {
  energy: number;
  mood: string;
  sleepQuality: number;
  stress: number;
  focus: number;
  obstacle: string;
  importantEvent: string;
};

export type Insight = {
  id: string;
  title: string;
  description: string;
  metric: string;
  trend: "up" | "down" | "stable";
};

export type WeeklyPlan = {
  day: string;
  date: string;
  focus: string;
  blocks: string[];
  habits: string[];
};
