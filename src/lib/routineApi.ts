import { apiFetch } from "./api";
import type {
  Agenda, Goal, GoalInput, GoalsDashboard, Habit, HabitDashboardItem, HabitInput,
  HabitsDashboard, ItemStatus, RoutineItem, RoutineItemInput,
} from "./api-contracts";

function rangeQuery(start: string, end: string) {
  return `start_date=${encodeURIComponent(start)}&end_date=${encodeURIComponent(end)}`;
}

export const routineApi = {
  agenda: (start: string, end: string) => apiFetch<Agenda>(`/routine/agenda?${rangeQuery(start, end)}`),

  listItems: () => apiFetch<RoutineItem[]>("/routine/items"),
  getItem: (id: string) => apiFetch<RoutineItem>(`/routine/items/${id}`),
  createItem: (input: RoutineItemInput) => apiFetch<RoutineItem>("/routine/items", { method: "POST", body: JSON.stringify(input) }),
  updateItem: (id: string, input: Partial<RoutineItemInput>) => apiFetch<RoutineItem>(`/routine/items/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteItem: (id: string) => apiFetch<{ message: string }>(`/routine/items/${id}`, { method: "DELETE" }),
  logItem: (routineItemId: string, date: string, status: ItemStatus) => apiFetch(`/routine/items/logs`, {
    method: "POST", body: JSON.stringify({ routine_item_id: routineItemId, log_date: date, status }),
  }),
  setVacation: (routineItemIds: string[], start: string, end: string) => apiFetch(`/routine/items/vacation`, {
    method: "POST", body: JSON.stringify({ routine_item_ids: routineItemIds, start_date: start, end_date: end }),
  }),

  listHabits: () => apiFetch<Habit[]>("/routine/habits"),
  getHabit: (id: string) => apiFetch<Habit>(`/routine/habits/${id}`),
  createHabit: (input: HabitInput) => apiFetch<Habit>("/routine/habits", { method: "POST", body: JSON.stringify(input) }),
  updateHabit: (id: string, input: Partial<HabitInput>) => apiFetch<Habit>(`/routine/habits/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteHabit: (id: string) => apiFetch<{ message: string }>(`/routine/habits/${id}`, { method: "DELETE" }),
  logHabit: (habitId: string, date: string, status: ItemStatus) => apiFetch(`/routine/habits/logs`, {
    method: "POST", body: JSON.stringify({ habit_id: habitId, log_date: date, status }),
  }),
  habitsDashboard: (start: string, end: string) => apiFetch<HabitsDashboard>(`/routine/habits/dashboard?${rangeQuery(start, end)}`),

  listGoals: () => apiFetch<Goal[]>("/routine/goals"),
  getGoal: (id: string) => apiFetch<Goal>(`/routine/goals/${id}`),
  createGoal: (input: GoalInput) => apiFetch<Goal>("/routine/goals", { method: "POST", body: JSON.stringify(input) }),
  updateGoal: (id: string, input: Partial<GoalInput>) => apiFetch<Goal>(`/routine/goals/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteGoal: (id: string) => apiFetch<{ message: string }>(`/routine/goals/${id}`, { method: "DELETE" }),
  goalsDashboard: (end: string, start?: string) => apiFetch<GoalsDashboard>(`/routine/goals/dashboard?${start ? `${rangeQuery(start, end)}` : `end_date=${encodeURIComponent(end)}`}`),
  goalHabits: (goalId: string, start: string, end: string) => apiFetch<HabitDashboardItem[]>(`/routine/goals/${goalId}/habits?${rangeQuery(start, end)}`),
};
