import { beforeEach, describe, expect, it, vi } from "vitest";

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("authenticated API client", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_API_URL = "https://api.test";
    const localStorage = createStorage();
    vi.stubGlobal("window", { localStorage, dispatchEvent: vi.fn() });
  });

  it("uses a single refresh for concurrent 401 responses and retries once", async () => {
    const session = await import("./session");
    session.saveSession({ accessToken: "old-access", refreshToken: "valid-refresh-token-123" });
    let refreshCalls = 0;
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/auth/refresh")) {
        refreshCalls += 1;
        return new Response(JSON.stringify({ access_token: "new-access", token_type: "bearer" }), { status: 200, headers: { "content-type": "application/json" } });
      }
      const authorization = new Headers(init?.headers).get("Authorization");
      return authorization === "Bearer new-access"
        ? new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } })
        : new Response(JSON.stringify({ detail: "expired" }), { status: 401, headers: { "content-type": "application/json" } });
    }));
    const { apiFetch } = await import("./api");
    const responses = await Promise.all([apiFetch<{ ok: boolean }>("/one"), apiFetch<{ ok: boolean }>("/two")]);
    expect(responses).toEqual([{ ok: true }, { ok: true }]);
    expect(refreshCalls).toBe(1);
    expect(session.getAccessToken()).toBe("new-access");
  });
});
