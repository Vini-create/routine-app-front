import { apiFetch, apiFetchResponse } from "../../../lib/api";
import { consumeSSE, AlfredStreamError, type SSEHandler } from "./sse";
import type {
  AICapabilitiesResponse,
  AIConversationDetail,
  AIConversationSummary,
  AIErrorResponse,
  AIInvokeRequest,
  AIInvokeResponse,
  AIUsageResponse,
  PatchOperation,
  PatchResolutionResponse,
  UUID,
} from "./alfred.types";

const AI_PREFIX = "/api/v1/ai";

async function parseStreamError(response: Response): Promise<AIErrorResponse> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  const record = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const detail = typeof record.detail === "string" ? record.detail : null;
  return {
    request_id: typeof record.request_id === "string" ? record.request_id : null,
    code: typeof record.code === "string" ? record.code : response.status === 429 ? "rate_limit_exceeded" : "invalid_request",
    message: typeof record.message === "string" ? record.message : detail ?? "Não foi possível concluir a solicitação.",
    details: record.details && typeof record.details === "object" ? record.details as Record<string, unknown> : {},
  };
}

export const alfredApi = {
  invoke(payload: AIInvokeRequest, signal?: AbortSignal) {
    return apiFetch<AIInvokeResponse>(`${AI_PREFIX}/invoke`, {
      method: "POST",
      body: JSON.stringify(payload),
      signal,
      timeoutMs: 60_000,
    });
  },

  async stream(payload: AIInvokeRequest, onEvent: SSEHandler, signal?: AbortSignal) {
    const response = await apiFetchResponse(`${AI_PREFIX}/stream`, {
      method: "POST",
      body: JSON.stringify(payload),
      signal,
      timeoutMs: 0,
    });
    if (!response.ok) {
      const error = await parseStreamError(response);
      if (response.status === 403 && /not verified|não verificado|email/i.test(error.message) && typeof window !== "undefined") {
        window.dispatchEvent(new Event("rotina-ai:email-unverified"));
      }
      throw new AlfredStreamError(error);
    }
    await consumeSSE(response, (event, data) => {
      if (event === "error") throw new AlfredStreamError(data as AIErrorResponse);
      onEvent(event, data);
    });
  },

  usage: () => apiFetch<AIUsageResponse>(`${AI_PREFIX}/usage`),
  capabilities: () => apiFetch<AICapabilitiesResponse>(`${AI_PREFIX}/capabilities`),

  createConversation(title: string) {
    return apiFetch<AIConversationSummary>(`${AI_PREFIX}/conversations`, {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  },

  listConversations: () => apiFetch<AIConversationSummary[]>(`${AI_PREFIX}/conversations`),
  getConversation: (conversationId: UUID) =>
    apiFetch<AIConversationDetail>(`${AI_PREFIX}/conversations/${conversationId}`),
  deleteConversation: (conversationId: UUID) =>
    apiFetch<void>(`${AI_PREFIX}/conversations/${conversationId}`, { method: "DELETE" }),

  acceptPatch(patchId: UUID, idempotencyKey: UUID) {
    return apiFetch<PatchResolutionResponse>(`${AI_PREFIX}/patches/${patchId}/accept`, {
      method: "POST",
      body: JSON.stringify({ idempotency_key: idempotencyKey }),
    });
  },

  rejectPatch(patchId: UUID, reason?: string) {
    return apiFetch<PatchResolutionResponse>(`${AI_PREFIX}/patches/${patchId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason: reason?.trim() || null }),
    });
  },

  editPatch(patchId: UUID, operations: PatchOperation[], idempotencyKey: UUID) {
    return apiFetch<PatchResolutionResponse>(`${AI_PREFIX}/patches/${patchId}/edit`, {
      method: "POST",
      body: JSON.stringify({ operations, idempotency_key: idempotencyKey }),
    });
  },
};
