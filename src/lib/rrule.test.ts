import { describe, expect, it } from "vitest";
import { buildRRule, describeRRule, parseRRule } from "./rrule";

describe("RRULE helpers", () => {
  it("creates the supported recurrence formats", () => {
    expect(buildRRule("daily")).toBe("FREQ=DAILY");
    expect(buildRRule("weekly", [1, 3, 5])).toBe("FREQ=WEEKLY;BYDAY=MO,WE,FR");
    expect(buildRRule("monthly", [1, 15])).toBe("FREQ=MONTHLY;BYMONTHDAY=1,15");
    expect(buildRRule("yearly")).toBe("FREQ=YEARLY");
  });

  it("uses safe defaults when no days are selected", () => {
    expect(buildRRule("weekly")).toBe("FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR");
    expect(buildRRule("monthly")).toBe("FREQ=MONTHLY;BYMONTHDAY=1");
    expect(describeRRule("FREQ=DAILY")).toBe("Todos os dias");
  });

  it("describes recurrence rules in a human-friendly localized format", () => {
    expect(describeRRule("FREQ=WEEKLY;BYDAY=MO,WE,FR", "pt-BR")).toBe("Toda semana · seg., qua. e sex.");
    expect(describeRRule("FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR", "es")).toBe("Cada semana · lun., mar., mié., jue. y vie.");
    expect(describeRRule("FREQ=MONTHLY;BYMONTHDAY=1,15", "en")).toBe("Every month · days 1 and 15");
    expect(describeRRule("FREQ=YEARLY", "fr")).toBe("Tous les ans");
    expect(describeRRule("FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH,FR,SA", "en")).toBe("Every day");
  });

  it("parses recurrence selections for editing", () => {
    expect(parseRRule("FREQ=WEEKLY;BYDAY=MO,WE,FR")).toEqual({ frequency: "weekly", selected: [1, 3, 5] });
    expect(parseRRule("FREQ=MONTHLY;BYMONTHDAY=1,15")).toEqual({ frequency: "monthly", selected: [1, 15] });
  });
});
