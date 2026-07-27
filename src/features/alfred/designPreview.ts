import type {
  AICapabilitiesResponse,
  AIConversationSummary,
  AIUsageResponse,
  AnalysisReport,
  ProposedPatch,
} from "./api/alfred.types";
import type { AlfredUiMessage } from "./alfred.ui.types";

const previewAnalysis: AnalysisReport = {
  diagnosis: {
    summary: "Sua rotina ficou mais carregada nesta semana e a taxa de conclusão caiu. O principal ponto de atenção é proteger os períodos de maior energia e reduzir tarefas concorrentes.",
    data_window: "Últimos 14 dias",
    data_quality: 0.86,
    observed_facts: [
      "3 de 12 atividades planejadas foram concluídas.",
      "A maior parte das pendências se concentrou no período da noite.",
    ],
  },
  patterns: [
    {
      name: "trend:completion_rate",
      description: "Direction=declining; delta=-0.1649.",
      evidence: ["A conclusão passou de 42% para 25% entre as duas últimas semanas."],
      confidence: 0.91,
    },
    {
      name: "trend:planned_load",
      description: "Direction=increasing; delta=0.18.",
      evidence: ["O volume planejado aumentou enquanto o tempo disponível permaneceu estável."],
      confidence: 0.84,
    },
    {
      name: "anomaly:recent_inactivity",
      description: "Transparent rule detected severity high.",
      evidence: ["Não houve registro de conclusão nos últimos três dias."],
      confidence: 0.88,
    },
  ],
  hypotheses: [
    {
      hypothesis: "O excesso de atividades no fim do dia pode estar elevando a fricção para começar.",
      supporting_evidence: ["Sete das nove pendências recentes estavam programadas após as 19h."],
      alternative_explanations: ["A semana pode ter incluído compromissos não registrados."],
      confidence: 0.78,
      sensitive: false,
    },
  ],
  recommendations: [
    {
      priority: 1,
      title: "Reduza a carga da noite",
      rationale: "É o período com maior concentração de atividades não concluídas.",
      action: "Mantenha apenas uma atividade prioritária depois das 19h pelos próximos sete dias.",
    },
    {
      priority: 2,
      title: "Proteja seu melhor horário",
      rationale: "As conclusões são mais consistentes no começo do dia.",
      action: "Reserve 30 minutos pela manhã para a tarefa mais importante.",
    },
  ],
  success_metrics: [
    {
      name: "completion_rate",
      baseline: 0.25,
      target: 0.6,
      evaluation_window_days: 7,
    },
  ],
  metadata: { preview: true },
};

const previewPatch: ProposedPatch = {
  patch_id: "preview-patch",
  entity_type: "routine_item",
  entity_id: "preview-routine-item",
  operations: [
    { op: "replace", path: "/start_at", value: "08:30" },
    { op: "replace", path: "/duration_minutes", value: 30 },
  ],
  reason: "Mover o bloco de foco para um horário com maior energia e reduzir sua duração inicial.",
  simulation: {
    status: "validated",
    before: { start_at: "20:00", duration_minutes: 60 },
    after: { start_at: "08:30", duration_minutes: 30 },
    changed_fields: ["start_at", "duration_minutes"],
  },
  success_metrics: [
    { metric: "taxa de conclusão", target: "60% em 7 dias" },
  ],
};

const createdAt = "2026-07-27T12:00:00.000Z";

export const previewConversations: AIConversationSummary[] = [
  {
    id: "design-preview-conversation",
    title: "Análise da minha semana",
    summary_en: null,
    created_at: createdAt,
    updated_at: createdAt,
  },
];

export const previewMessages: AlfredUiMessage[] = [
  {
    id: "preview-user-message",
    role: "user",
    content: "Minha rotina está cansativa. Você consegue analisar meus hábitos?",
    createdAt,
    status: "completed",
    selectedSkill: "analisar_progresso",
  },
  {
    id: "preview-assistant-message",
    role: "assistant",
    content: "Analisei seus registros recentes e encontrei alguns pontos que podem deixar sua rotina mais leve e sustentável.",
    createdAt: "2026-07-27T12:00:10.000Z",
    status: "completed",
    route: "feedbacker",
    requestId: "preview-request",
    analysis: previewAnalysis,
    references: [
      {
        document_id: "preview-document",
        chunk_id: "preview-chunk",
        title: "Seu histórico de rotina",
        source: "Dados pessoais do período analisado",
        source_ids: [],
        topic: "consistência",
        supporting_excerpt: "Atividades matinais apresentaram maior regularidade nas últimas duas semanas.",
        retrieval_score: 0.93,
        rerank_score: 0.91,
      },
    ],
    proposedPatch: previewPatch,
    requiresConfirmation: true,
    patchStatus: "pending",
  },
];

export const previewCapabilities: AICapabilitiesResponse = {
  plan: "pro",
  capabilities: {
    conversation: true,
    deep_analysis: true,
    rag: true,
    patch_generation: true,
    memory: "advanced",
    streaming: true,
  },
};

export const previewUsage: AIUsageResponse = {
  plan: "pro",
  weighted_units_today: { used: 4, limit: 30, remaining: 26, reset_at: createdAt },
  standard_requests_today: { used: 4, limit: 30, remaining: 26, reset_at: createdAt },
  rag_requests_today: { used: 1, limit: 10, remaining: 9, reset_at: createdAt },
  deep_analyses_this_week: { used: 1, limit: 5, remaining: 4, reset_at: createdAt },
  requests_per_minute: 10,
};

export function previewReply(message: string): Pick<
  AlfredUiMessage,
  "content" | "analysis" | "references" | "proposedPatch" | "requiresConfirmation" | "patchStatus" | "route"
> {
  return {
    content: `Esta é uma resposta de demonstração para você validar o visual localmente. Sua mensagem foi: “${message}”`,
    analysis: previewAnalysis,
    references: [],
    proposedPatch: null,
    requiresConfirmation: false,
    patchStatus: undefined,
    route: "alfred",
  };
}
