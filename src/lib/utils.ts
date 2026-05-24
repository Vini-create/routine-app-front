export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function percentageLabel(value: number) {
  return `${Math.min(100, Math.max(0, value))}%`;
}
