import type { Goal } from "./api-contracts";
import { fromDateKey } from "./date";

const millisecondsPerDay = 86_400_000;

function localDateSerial(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / millisecondsPerDay;
}

export function goalDeadlineProgress(
  goal: Pick<Goal, "created_at" | "target_date">,
  today = new Date(),
) {
  if (!goal.target_date) {
    return { percentage: 0, daysRemaining: 0, expired: false };
  }

  const target = fromDateKey(goal.target_date);
  const parsedCreation = goal.created_at ? new Date(goal.created_at) : today;
  const creation = Number.isNaN(parsedCreation.getTime()) ? today : parsedCreation;
  const creationDay = localDateSerial(creation);
  const targetDay = localDateSerial(target);
  const todayDay = localDateSerial(today);
  const totalDays = Math.max(1, targetDay - creationDay);
  const elapsedDays = Math.min(totalDays, Math.max(0, todayDay - creationDay));
  const daysRemaining = Math.max(0, targetDay - todayDay);

  return {
    percentage: Math.round((elapsedDays / totalDays) * 100),
    daysRemaining,
    expired: todayDay > targetDay,
  };
}
