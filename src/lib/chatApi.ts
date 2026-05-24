import { apiFetch, useLocalFallbackApi } from "./api";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type ChatContextPayload = {
  locale: string;
  timezone: string;
  source: "assistant-page";
};

export type ChatHistoryRequest = {
  conversationId: string;
};

export type ChatHistoryResponse = {
  conversationId: string;
  messages: ChatMessage[];
};

export type SendChatMessageRequest = {
  conversationId: string;
  clientMessageId: string;
  message: string;
  context: ChatContextPayload;
};

export type SendChatMessageResponse = {
  conversationId: string;
  message: ChatMessage;
};

const fallbackConversations = new Map<string, ChatMessage[]>();

export const defaultConversationId = "default";

export async function fetchChatHistory(request: ChatHistoryRequest): Promise<ChatHistoryResponse> {
  if (useLocalFallbackApi) return fallbackFetchChatHistory(request);

  // API_CONNECTION_POINT: expose this route in FastAPI for chat history.
  return apiFetch<ChatHistoryResponse>(`/chat/conversations/${request.conversationId}/messages`);
}

export async function sendChatMessage(
  request: SendChatMessageRequest,
  options?: { fallbackResponse?: string },
): Promise<SendChatMessageResponse> {
  if (useLocalFallbackApi) return fallbackSendChatMessage(request, options?.fallbackResponse);

  // API_CONNECTION_POINT: expose this route in FastAPI for chatbot turns.
  return apiFetch<SendChatMessageResponse>(`/chat/conversations/${request.conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

function fallbackFetchChatHistory(request: ChatHistoryRequest): ChatHistoryResponse {
  return {
    conversationId: request.conversationId,
    messages: fallbackConversations.get(request.conversationId) ?? [],
  };
}

async function fallbackSendChatMessage(request: SendChatMessageRequest, fallbackResponse?: string): Promise<SendChatMessageResponse> {
  await new Promise((resolve) => window.setTimeout(resolve, 420));

  const userMessage: ChatMessage = {
    id: request.clientMessageId,
    role: "user",
    content: request.message,
    createdAt: new Date().toISOString(),
  };
  const assistantMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: fallbackResponse ?? "I will consider your current context and suggest a lighter adjustment for today.",
    createdAt: new Date().toISOString(),
  };

  fallbackConversations.set(request.conversationId, [
    ...(fallbackConversations.get(request.conversationId) ?? []),
    userMessage,
    assistantMessage,
  ]);

  return {
    conversationId: request.conversationId,
    message: assistantMessage,
  };
}
