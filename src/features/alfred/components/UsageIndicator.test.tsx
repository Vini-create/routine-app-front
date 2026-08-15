import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { AIUsageResponse } from "../api/alfred.types";
import { buildUsageRows, UsageIndicator, type UsageLabels } from "./UsageIndicator";

const labels: UsageLabels = {
  button: "Uso",
  title: "Uso do Alfred",
  standard: "Conversas",
  rag: "Consultas com fontes",
  deepAnalysis: "Análises profundas",
  rateLimit: "Velocidade de envio",
  remaining: "Restantes",
  used: "Usadas",
  resetsAt: "Renova em",
  perMinute: "por minuto",
  close: "Fechar",
  unlimited: "Ilimitado",
};

const usage: AIUsageResponse = {
  plan: "free",
  weighted_units_today: { used: 2, limit: 30, remaining: 28, reset_at: "2026-08-15T03:00:00Z" },
  standard_requests_today: { used: 2, limit: 30, remaining: 28, reset_at: "2026-08-15T03:00:00Z" },
  rag_requests_today: { used: 1, limit: 15, remaining: 14, reset_at: "2026-08-15T03:00:00Z" },
  deep_analyses_this_week: { used: 1, limit: 3, remaining: 2, reset_at: "2026-08-17T03:00:00Z" },
  requests_per_minute: 15,
};

describe("UsageIndicator", () => {
  it("maps every user-facing Alfred quota", () => {
    const rows = buildUsageRows(usage, labels);

    expect(rows.map((row) => [row.key, row.quota.remaining, row.quota.limit])).toEqual([
      ["standard", 28, 30],
      ["rag", 14, 15],
      ["deep", 2, 3],
    ]);
  });

  it("renders usage as an accessible button", () => {
    const html = renderToStaticMarkup(
      <UsageIndicator usage={usage} loading={false} labels={labels} locale="pt-BR" />,
    );

    expect(html).toContain("Uso");
    expect(html).toContain("28/30");
    expect(html).toContain("aria-haspopup=\"dialog\"");
  });
});
