export type UUID = string;
export type ISODateTime = string;

export type SelectedSkill =
  | "auto"
  | "conversar"
  | "analisar_progresso"
  | "reorganizar_rotina"
  | "criar_plano"
  | "consultar_conhecimento";

export type InternalRoute =
  | "safe_response"
  | "deterministic"
  | "alfred"
  | "feedbacker"
  | "rag_then_alfred"
  | "rag_then_feedbacker";

export type PatchEntityType = "goal" | "habit" | "routine_item" | "profile";
export type PatchStatus = "pending" | "applied" | "rejected" | "expired";

export type AIErrorCode =
  | "invalid_request"
  | "idempotency_key_reused"
  | "conversation_not_found"
  | "conversation_forbidden"
  | "user_context_forbidden"
  | "user_context_unavailable"
  | "plan_unavailable"
  | "rate_limit_exceeded"
  | "daily_quota_exceeded"
  | "daily_standard_limit_exceeded"
  | "daily_rag_limit_exceeded"
  | "weekly_deep_analysis_limit_exceeded"
  | "concurrent_stream_limit_exceeded"
  | "global_cost_limit_exceeded"
  | "patch_not_found"
  | "patch_forbidden"
  | "patch_expired"
  | "patch_already_resolved"
  | "model_unavailable"
  | "model_invalid_output"
  | "graph_execution_failed";

export interface AIInvokeRequest {
  conversation_id?: UUID | null;
  message: string;
  selected_skill?: SelectedSkill;
  screen_context?: Record<string, unknown> | null;
  idempotency_key?: UUID | null;
}

export interface AIUsage {
  plan: string;
  units_reserved: number;
  units_consumed: number;
  units_remaining: number | null;
}

export interface QuotaUsage {
  used: number;
  limit: number | null;
  remaining: number | null;
  reset_at: ISODateTime;
}

export interface AIUsageResponse {
  plan: string;
  weighted_units_today: QuotaUsage;
  standard_requests_today: QuotaUsage;
  rag_requests_today: QuotaUsage;
  deep_analyses_this_week: QuotaUsage;
  requests_per_minute: number;
}

export interface AICapabilitiesResponse {
  plan: string;
  capabilities: {
    conversation: boolean;
    deep_analysis: boolean;
    rag: boolean;
    patch_generation: boolean;
    memory: "basic" | "advanced" | string;
    streaming: boolean;
  };
}

export interface EvidenceReference {
  document_id: string;
  chunk_id: string;
  title: string;
  source: string;
  source_ids: string[];
  topic: string | null;
  supporting_excerpt: string | null;
  retrieval_score: number;
  rerank_score: number;
}

export interface ExecutionDiagnosis {
  summary: string;
  data_window: string;
  data_quality: number;
  observed_facts: string[];
}

export interface IdentifiedPattern {
  name: string;
  description: string;
  evidence: string[];
  confidence: number;
}

export interface RootCauseHypothesis {
  hypothesis: string;
  supporting_evidence: string[];
  alternative_explanations: string[];
  confidence: number;
  sensitive: boolean;
}

export interface Recommendation {
  priority: number;
  title: string;
  rationale: string;
  action: string;
}

export interface SuccessMetric {
  name: string;
  baseline: number | string | null;
  target: number | string;
  evaluation_window_days: number;
}

export interface AnalysisReport {
  diagnosis: ExecutionDiagnosis;
  patterns: IdentifiedPattern[];
  hypotheses: RootCauseHypothesis[];
  recommendations: Recommendation[];
  success_metrics: SuccessMetric[];
  metadata: Record<string, unknown>;
}

export interface PatchOperation {
  op: "add" | "remove" | "replace";
  path: `/${string}`;
  value?: string | number | boolean | null;
}

export interface PatchSimulation {
  status: "validated";
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  changed_fields: string[];
}

export interface ProposedPatch {
  patch_id: UUID | null;
  entity_type: PatchEntityType;
  entity_id: UUID | null;
  operations: PatchOperation[];
  reason: string;
  simulation: PatchSimulation | null;
  success_metrics: Array<Record<string, unknown>>;
}

export interface AIInvokeResponse {
  request_id: UUID;
  conversation_id: UUID;
  route: InternalRoute;
  message: string;
  references: EvidenceReference[];
  analysis: AnalysisReport | null;
  proposed_patch: ProposedPatch | null;
  requires_confirmation: boolean;
  usage: AIUsage;
}

export interface AIErrorResponse {
  request_id: UUID | null;
  code: AIErrorCode | string;
  message: string;
  details: Record<string, unknown>;
}

export interface AIConversationSummary {
  id: UUID;
  title: string;
  summary_en: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface AIMessage {
  id: UUID;
  role: "user" | "assistant" | "system";
  content: string;
  route: InternalRoute | null;
  request_id: UUID;
  created_at: ISODateTime;
  analysis: AnalysisReport | null;
  references: EvidenceReference[] | null;
  proposed_patch: ProposedPatch | null;
  requires_confirmation: boolean | null;
  patch_status: PatchStatus | null;
}

export interface AIConversationDetail extends AIConversationSummary {
  messages: AIMessage[];
}

export interface PatchResolutionResponse {
  patch_id: UUID;
  status: PatchStatus;
  proposed_patch: ProposedPatch;
  audit_id: UUID | null;
  requires_confirmation: boolean;
}

export interface AlfredStreamDone {
  request_id: UUID;
  conversation_id: UUID;
  route: InternalRoute;
  usage: AIUsage;
}

export interface AlfredStreamPatch {
  patch: ProposedPatch;
  requires_confirmation: boolean;
}
