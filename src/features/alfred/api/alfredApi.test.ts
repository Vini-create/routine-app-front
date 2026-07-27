import { beforeEach, describe, expect, it, vi } from "vitest";

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("Alfred API client", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_API_URL = "https://api.test";
    vi.stubGlobal("window", { localStorage: createStorage(), dispatchEvent: vi.fn() });
  });

  it("uses the authenticated unified route and serializes snake_case fields", async () => {
    const session = await import("../../../lib/session");
    session.saveSession({ accessToken: "access-token", refreshToken: "valid-refresh-token-123" });
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      request_id: "request-1",
      conversation_id: "conversation-1",
      route: "alfred",
      message: "Done",
      references: [],
      analysis: null,
      proposed_patch: null,
      requires_confirmation: false,
      usage: { plan: "free", units_reserved: 1, units_consumed: 1, units_remaining: null },
    }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const { alfredApi } = await import("./alfredApi");

    await alfredApi.invoke({
      conversation_id: null,
      message: "Plan my day",
      selected_skill: "criar_plano",
      idempotency_key: "same-key",
    });

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.test/api/v1/ai/invoke");
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer access-token");
    expect(JSON.parse(String(init.body))).toEqual({
      conversation_id: null,
      message: "Plan my day",
      selected_skill: "criar_plano",
      idempotency_key: "same-key",
    });
  });

  it("does not parse a 204 conversation deletion response", async () => {
    const session = await import("../../../lib/session");
    session.saveSession({ accessToken: "access-token", refreshToken: "valid-refresh-token-123" });
    const response = new Response(null, { status: 204 });
    const jsonSpy = vi.spyOn(response, "json");
    vi.stubGlobal("fetch", vi.fn(async () => response));
    const { alfredApi } = await import("./alfredApi");

    await expect(alfredApi.deleteConversation("conversation-1")).resolves.toBeUndefined();
    expect(jsonSpy).not.toHaveBeenCalled();
  });

  it("normalizes AI error metadata without logging personal content", async () => {
    const session = await import("../../../lib/session");
    session.saveSession({ accessToken: "access-token", refreshToken: "valid-refresh-token-123" });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      request_id: "request-429",
      code: "daily_standard_limit_exceeded",
      message: "Daily limit reached.",
      details: { reset_at: "2026-07-27T03:00:00Z" },
    }), { status: 429, headers: { "content-type": "application/json" } })));
    const { alfredApi } = await import("./alfredApi");
    const { ApiError } = await import("../../../lib/api");

    const error = await alfredApi.invoke({ message: "private", idempotency_key: "same-key" }).catch((caught) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 429,
      code: "daily_standard_limit_exceeded",
      requestId: "request-429",
    });
  });

  it("handles an HTTP error before the SSE stream starts", async () => {
    const session = await import("../../../lib/session");
    session.saveSession({ accessToken: "access-token", refreshToken: "valid-refresh-token-123" });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      request_id: "request-stream-429",
      code: "concurrent_stream_limit_exceeded",
      message: "A stream is already active.",
      details: {},
    }), { status: 429, headers: { "content-type": "application/json" } })));
    const { alfredApi } = await import("./alfredApi");
    const { AlfredStreamError } = await import("./sse");

    const error = await alfredApi.stream({ message: "Plan", idempotency_key: "same-key" }, vi.fn()).catch((caught) => caught);

    expect(error).toBeInstanceOf(AlfredStreamError);
    expect(error.payload).toMatchObject({
      request_id: "request-stream-429",
      code: "concurrent_stream_limit_exceeded",
    });
  });
});
