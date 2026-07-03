export type ApiLanguage = "english_us" | "portuguese_br" | "french" | "spanish";
export type AppLanguage = "en" | "pt-BR" | "fr" | "es";
export type ItemStatus = "pending" | "completed" | "uncompleted" | "vacation";
export type ConsistencyLevel = "fire" | "grass" | "ice" | "neutral";
export type GoalCategory = "health" | "productivity" | "learning" | "fitness" | "mental_wellness" | "other";
export type ScheduleType = "single" | "recurring";
export type ItemType = "habit" | "task" | "event" | "reminder";

export type UserMe = {
  id: string;
  email: string;
  display_name: string | null;
  language: ApiLanguage | null;
  signature_plan: "free" | "pro" | "max" | null;
  is_verified: boolean;
  has_password: boolean;
};

export type Goal = {
  id: string;
  title: string;
  description: string | null;
  category: GoalCategory | null;
  target_date: string | null;
  created_at?: string;
};

export type GoalInput = {
  title: string;
  description?: string | null;
  category?: GoalCategory | null;
  target_date: string;
};

export type Habit = {
  id: string;
  goal_id: string | null;
  name: string;
  description: string | null;
  duration_minutes: number;
  recurrence_rule: string;
  start_date: string;
  status: string;
};

export type HabitInput = {
  goal_id: string;
  name: string;
  description?: string | null;
  duration_minutes: number;
  recurrence_rule: string;
  start_date: string;
};

export type HabitOccurrence = { date: string; status: ItemStatus; log_id: string | null };
export type HabitDashboardItem = {
  habit: Habit;
  goal: Goal | null;
  expected_count: number;
  completed_count: number;
  uncompleted_count: number;
  pending_count: number;
  consistency_percent: number;
  consistency_level: ConsistencyLevel;
  occurrences: HabitOccurrence[];
};
export type HabitsDashboard = { start_date: string; end_date: string; habits: HabitDashboardItem[] };

export type GoalDashboardItem = {
  goal: Goal;
  expected_count: number;
  completed_count: number;
  uncompleted_count: number;
  pending_count: number;
  consistency_percent: number;
  consistency_level: ConsistencyLevel;
  habits: HabitDashboardItem[];
};
export type GoalsDashboard = { start_date: string; end_date: string; goals: GoalDashboardItem[] };

export type RoutineItem = {
  id: string;
  schedule_type: ScheduleType;
  start_at: string;
  end_at: string | null;
  recurrence_rule: string | null;
  item_type: ItemType;
  description: string | null;
  title: string;
  goal_id: string | null;
  duration_minutes: number;
};

export type RoutineItemInput = Omit<RoutineItem, "id">;
export type RoutineItemOccurrence = {
  item: RoutineItem;
  occurrence_at: string;
  occurrence_date: string;
  status: ItemStatus;
  log_id: string | null;
};
export type HabitAgendaOccurrence = {
  habit: Habit;
  goal: Goal | null;
  occurrence_date: string;
  status: ItemStatus;
  log_id: string | null;
};
export type Agenda = {
  start_date: string;
  end_date: string;
  routine_items: RoutineItemOccurrence[];
  habits: HabitAgendaOccurrence[];
};

export const appToApiLanguage: Record<AppLanguage, ApiLanguage> = {
  "pt-BR": "portuguese_br",
  en: "english_us",
  es: "spanish",
  fr: "french",
};

export const apiToAppLanguage: Record<ApiLanguage, AppLanguage> = {
  portuguese_br: "pt-BR",
  english_us: "en",
  spanish: "es",
  french: "fr",
};
