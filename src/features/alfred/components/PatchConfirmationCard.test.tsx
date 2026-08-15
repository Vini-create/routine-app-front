import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ProposedPatch } from "../api/alfred.types";
import { PatchConfirmationCard } from "./PatchConfirmationCard";

const labels = {
  title: "Mudança sugerida",
  reason: "Por que Alfred sugere isso",
  before: "Antes",
  after: "Depois",
  accept: "Aceitar mudança",
  edit: "Ajustar",
  reject: "Rejeitar",
  saveEdit: "Simular ajuste",
  rejectReason: "Por que isso não funciona para você?",
  optional: "opcional",
  applied: "Aplicada",
  rejected: "Rejeitada",
  pending: "Aguardando confirmação",
  expired: "Expirada",
  error: "Não consegui resolver esta sugestão.",
  cancel: "Cancelar",
  successMetrics: "Como o resultado será medido",
  minutes: "min",
  days: "dias",
  fields: {
    duration_minutes: "Duração",
    name: "Métrica",
    baseline: "Ponto de partida",
    target: "Objetivo",
    evaluation_window_days: "Prazo de avaliação",
  },
  values: {
    true: "Sim",
    false: "Não",
    current: "Atual",
    increase: "Aumentar",
  },
};

const patch: ProposedPatch = {
  patch_id: "58066a72-6097-4b4f-869c-811e8b85780f",
  entity_type: "habit",
  entity_id: "2dd29a14-3d4f-4766-9abb-1af70735f084",
  operations: [{ op: "replace", path: "/duration_minutes", value: 40 }],
  reason: "Para começar aos poucos, reduza o treino de 60 para 40 minutos.",
  simulation: {
    status: "validated",
    before: { duration_minutes: 60 },
    after: { duration_minutes: 40 },
    changed_fields: ["duration_minutes"],
  },
  success_metrics: [{
    name: "Taxa de conclusão do item",
    baseline: "current",
    target: "increase",
    evaluation_window_days: 14,
  }],
};

describe("PatchConfirmationCard", () => {
  it("renders the persisted backend suggestion as a clear pending confirmation", () => {
    const queryClient = new QueryClient();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <PatchConfirmationCard initialPatch={patch} labels={labels} />
      </QueryClientProvider>,
    );

    expect(html).toContain("Mudança sugerida");
    expect(html).toContain("Aguardando confirmação");
    expect(html).toContain("60 min");
    expect(html).toContain("40 min");
    expect(html).toContain("Duração");
    expect(html).toContain("Taxa de conclusão do item");
    expect(html).toContain("Ponto de partida: Atual");
    expect(html).toContain("Objetivo: Aumentar");
    expect(html).toContain("Prazo de avaliação: 14 dias");
    expect(html).toContain("Aceitar mudança");
    expect(html).toContain("Ajustar");
    expect(html).toContain("Rejeitar");
    expect(html).not.toContain("duration_minutes");
    expect(html).not.toContain("evaluation_window_days");
  });
});
