import type { AIMessage } from "./api/alfred.types";
import type { AlfredUiMessage } from "./alfred.ui.types";

export function toUiMessages(messages: AIMessage[]): AlfredUiMessage[] {
  return messages
    .filter((message) => message.role !== "system")
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))
    .map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.created_at,
      status: "completed" as const,
      requestId: message.request_id,
      route: message.route,
      ...(message.role === "assistant" ? {
        analysis: message.analysis,
        references: message.references ?? [],
        proposedPatch: message.proposed_patch,
        requiresConfirmation: message.requires_confirmation ?? false,
        patchStatus: message.patch_status ?? undefined,
      } : {}),
    }));
}
