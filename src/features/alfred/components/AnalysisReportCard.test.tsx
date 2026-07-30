import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ptBR } from "../../../i18n/messages/pt-BR";

import { AnalysisReportCard } from "./AnalysisReportCard";

describe("AnalysisReportCard", () => {
  it("turns internal pattern evidence into a user-friendly explanation", () => {
    const html = renderToStaticMarkup(
      <AnalysisReportCard
        locale="pt-BR"
        labels={ptBR.assistant.analysis}
        analysis={{
          diagnosis: {
            summary: "Sua carga planejada aumentou.",
            data_window: "2026-07-01..2026-07-28",
            data_quality: 1,
            observed_facts: [],
          },
          patterns: [{
            name: "trend:planned_load",
            description: "Direction=increasing; delta=not_available.",
            evidence: ['{"type":"planned_load","direction":"increasing","previous_minutes":1920,"recent_minutes":4780,"confidence":1}'],
            confidence: 1,
          }],
          hypotheses: [],
          recommendations: [],
          success_metrics: [],
          metadata: {},
        }}
      />,
    );

    expect(html).toContain("Como Alfred chegou a esta conclusão");
    expect(html).toContain("A carga planejada passou de 32 h para 79 h 40 min");
    expect(html).toContain("Alta · 100%");
    expect(html).not.toContain("previous_minutes");
    expect(html).not.toContain("Direction=increasing");
  });

  it("explains recent inactivity without exposing its internal field name", () => {
    const html = renderToStaticMarkup(
      <AnalysisReportCard
        locale="pt-BR"
        labels={ptBR.assistant.analysis}
        analysis={{
          diagnosis: {
            summary: "Houve uma pausa recente.",
            data_window: "2026-07-01..2026-07-28",
            data_quality: 0.8,
            observed_facts: [],
          },
          patterns: [{
            name: "anomaly:recent_inactivity",
            description: "Transparent rule detected severity high.",
            evidence: ['{"expected_7d":37}'],
            confidence: 0.8,
          }],
          hypotheses: [],
          recommendations: [],
          success_metrics: [],
          metadata: {},
        }}
      />,
    );

    expect(html).toContain("37 atividades planejadas nos últimos 7 dias");
    expect(html).not.toContain("expected_7d");
    expect(html).not.toContain("Transparent rule");
  });
});
