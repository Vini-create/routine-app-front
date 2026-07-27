import type { AIInvokeRequest, SelectedSkill, UUID } from "./alfred.types";

type CreateTurnPayloadInput = {
  conversationId: UUID | null;
  message: string;
  selectedSkill: SelectedSkill;
};

type IdFactory = () => UUID;

export function createTurnPayload(
  input: CreateTurnPayloadInput,
  createId: IdFactory = () => crypto.randomUUID(),
): AIInvokeRequest {
  return {
    conversation_id: input.conversationId,
    message: input.message,
    selected_skill: input.selectedSkill,
    screen_context: { screen: "alfred" },
    idempotency_key: createId(),
  };
}
