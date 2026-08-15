import { describe, expect, it } from "vitest";

import type { AIMessage } from "./api/alfred.types";
import { toUiMessages } from "./conversationMapper";

describe("toUiMessages", () => {
  it("restores a pending patch and its simulation from conversation history", () => {
    const message = {
      id: "m1",
      role: "assistant",
      content: "Preparei uma mudança para você confirmar.",
      route: "feedbacker",
      request_id: "r1",
      created_at: "2026-08-14T12:00:00Z",
      analysis: null,
      references: [],
      proposed_patch: {
        patch_id: "p1",
        entity_type: "habit",
        entity_id: "h1",
        operations: [{ op: "replace", path: "/duration_minutes", value: 40 }],
        reason: "Reduzir a duração.",
        simulation: {
          status: "validated",
          before: { duration_minutes: 60 },
          after: { duration_minutes: 40 },
          changed_fields: ["duration_minutes"],
        },
        success_metrics: [],
      },
      requires_confirmation: true,
      patch_status: "pending",
    } as AIMessage;

    expect(toUiMessages([message])[0]).toMatchObject({
      proposedPatch: {
        patch_id: "p1",
        simulation: {
          before: { duration_minutes: 60 },
          after: { duration_minutes: 40 },
        },
      },
      requiresConfirmation: true,
      patchStatus: "pending",
    });
  });
});
