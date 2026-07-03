const dayCodes = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly";

export function buildRRule(frequency: RecurrenceFrequency, selected: number[] = []) {
  if (frequency === "daily") return "FREQ=DAILY";
  if (frequency === "yearly") return "FREQ=YEARLY";
  if (frequency === "monthly") {
    const days = selected.length ? selected : [1];
    return `FREQ=MONTHLY;BYMONTHDAY=${days.join(",")}`;
  }
  const days = selected.length ? selected : [1, 2, 3, 4, 5];
  return `FREQ=WEEKLY;BYDAY=${days.map((day) => dayCodes[day]).join(",")}`;
}

export function describeRRule(rule: string) {
  if (rule.includes("FREQ=DAILY")) return "Todos os dias";
  if (rule.includes("FREQ=YEARLY")) return "Todo ano";
  if (rule.includes("FREQ=MONTHLY")) return `Mensal · ${rule.split("BYMONTHDAY=")[1] ?? "1"}`;
  return `Semanal · ${(rule.split("BYDAY=")[1] ?? "").replaceAll(",", " · ")}`;
}

export function parseRRule(rule: string): { frequency: RecurrenceFrequency; selected: number[] } {
  if (rule.includes("FREQ=DAILY")) return { frequency: "daily", selected: [] };
  if (rule.includes("FREQ=YEARLY")) return { frequency: "yearly", selected: [] };
  if (rule.includes("FREQ=MONTHLY")) {
    return { frequency: "monthly", selected: (rule.split("BYMONTHDAY=")[1] ?? "1").split(",").map(Number).filter(Number.isInteger) };
  }
  const codes = (rule.split("BYDAY=")[1] ?? "MO,TU,WE,TH,FR").split(",");
  return { frequency: "weekly", selected: codes.map((code) => dayCodes.indexOf(code)).filter((day) => day >= 0) };
}
