const dayCodes = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly";
export type RecurrenceLocale = "pt-BR" | "en" | "es" | "fr";

const recurrenceCopy: Record<RecurrenceLocale, {
  daily: string;
  yearly: string;
  weekly: string;
  monthly: string;
  day: string;
  days: string;
  custom: string;
  weekdays: string[];
}> = {
  "pt-BR": {
    daily: "Todos os dias",
    yearly: "Todo ano",
    weekly: "Toda semana",
    monthly: "Todo mês",
    day: "dia",
    days: "dias",
    custom: "Frequência personalizada",
    weekdays: ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."],
  },
  en: {
    daily: "Every day",
    yearly: "Every year",
    weekly: "Every week",
    monthly: "Every month",
    day: "day",
    days: "days",
    custom: "Custom frequency",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
  es: {
    daily: "Todos los días",
    yearly: "Cada año",
    weekly: "Cada semana",
    monthly: "Cada mes",
    day: "día",
    days: "días",
    custom: "Frecuencia personalizada",
    weekdays: ["dom.", "lun.", "mar.", "mié.", "jue.", "vie.", "sáb."],
  },
  fr: {
    daily: "Tous les jours",
    yearly: "Tous les ans",
    weekly: "Chaque semaine",
    monthly: "Chaque mois",
    day: "jour",
    days: "jours",
    custom: "Fréquence personnalisée",
    weekdays: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
  },
};

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

export function describeRRule(rule: string, locale: RecurrenceLocale = "pt-BR") {
  const copy = recurrenceCopy[locale] ?? recurrenceCopy["pt-BR"];
  if (rule.includes("FREQ=DAILY")) return copy.daily;
  if (rule.includes("FREQ=YEARLY")) return copy.yearly;

  if (rule.includes("FREQ=MONTHLY")) {
    const monthDays = (rule.match(/(?:^|;)BYMONTHDAY=([^;]+)/)?.[1] ?? "1")
      .split(",")
      .map(Number)
      .filter((day) => Number.isInteger(day) && day >= 1 && day <= 31);
    const days = monthDays.length ? monthDays : [1];
    const dayLabel = days.length === 1 ? copy.day : copy.days;
    return `${copy.monthly} · ${dayLabel} ${new Intl.ListFormat(locale, { type: "conjunction" }).format(days.map(String))}`;
  }

  if (rule.includes("FREQ=WEEKLY")) {
    const codes = (rule.match(/(?:^|;)BYDAY=([^;]+)/)?.[1] ?? "MO,TU,WE,TH,FR").split(",");
    const weekdays = codes
      .map((code) => dayCodes.indexOf(code))
      .filter((day) => day >= 0)
      .map((day) => copy.weekdays[day]);
    if (weekdays.length === 7) return copy.daily;
    if (weekdays.length) {
      return `${copy.weekly} · ${new Intl.ListFormat(locale, { type: "conjunction" }).format(weekdays)}`;
    }
  }

  return copy.custom;
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
