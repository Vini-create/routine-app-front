import { describe, expect, it, vi } from "vitest";
import { createTurnPayload } from "./createTurnPayload";

describe("createTurnPayload", () => {
  it("binds a fresh idempotency key to every intentional message", () => {
    const createId = vi
      .fn()
      .mockReturnValueOnce("turn-1")
      .mockReturnValueOnce("turn-2");

    const first = createTurnPayload(
      {
        conversationId: "conversation-1",
        message: "Olá",
        selectedSkill: "auto",
      },
      createId,
    );
    const second = createTurnPayload(
      {
        conversationId: "conversation-1",
        message: "Quem é você?",
        selectedSkill: "conversar",
      },
      createId,
    );

    expect(first.idempotency_key).toBe("turn-1");
    expect(second.idempotency_key).toBe("turn-2");
    expect(first.message).toBe("Olá");
    expect(second.message).toBe("Quem é você?");
  });

  it.each([
    "auto",
    "conversar",
    "analisar_progresso",
    "reorganizar_rotina",
    "criar_plano",
    "consultar_conhecimento",
  ] as const)("preserves the %s skill selected in the menu", (selectedSkill) => {
    const payload = createTurnPayload(
      {
        conversationId: null,
        message: "Teste de habilidade",
        selectedSkill,
      },
      () => "turn-skill",
    );

    expect(payload.selected_skill).toBe(selectedSkill);
    expect(payload.screen_context).toEqual({ screen: "alfred" });
  });
});
