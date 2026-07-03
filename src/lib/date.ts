export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function fromDateKey(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function startOfWeek(date = new Date()) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = result.getDay();
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));
  return result;
}

export function weekRange(date = new Date()) {
  const start = startOfWeek(date);
  return { start: toDateKey(start), end: toDateKey(addDays(start, 6)) };
}

export function monthRange(date = new Date()) {
  return {
    start: toDateKey(new Date(date.getFullYear(), date.getMonth(), 1)),
    end: toDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  };
}

export function toLocalDateTime(date: string, time: string) {
  const local = new Date(`${date}T${time}:00`);
  const offset = -local.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
  const minutes = String(Math.abs(offset) % 60).padStart(2, "0");
  return `${date}T${time}:00${sign}${hours}:${minutes}`;
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}
