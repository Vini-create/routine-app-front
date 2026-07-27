import { clearSession, getAccessToken, getRefreshToken, saveAccessToken } from "./session";

export const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export type ValidationIssue = {
  field?: string;
  message: string;
};

export class ApiError extends Error {
  status: number;
  detail: string;
  issues: ValidationIssue[];
  code: string | null;
  requestId: string | null;
  details: Record<string, unknown>;

  constructor(
    status: number,
    detail: string,
    issues: ValidationIssue[] = [],
    metadata: { code?: string | null; requestId?: string | null; details?: Record<string, unknown> } = {},
  ) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.issues = issues;
    this.code = metadata.code ?? null;
    this.requestId = metadata.requestId ?? null;
    this.details = metadata.details ?? {};
  }
}

type ApiFetchOptions = RequestInit & {
  authenticated?: boolean;
  retryAuth?: boolean;
  timeoutMs?: number;
};

let refreshPromise: Promise<string> | null = null;
const requestTimeoutMs = 15_000;

export function buildApiUrl(path: string) {
  if (!apiBaseUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function emitSessionExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("rotina-ai:session-expired"));
  }
}

function normalizeError(status: number, body: unknown) {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const message = typeof record.message === "string" ? record.message : null;
    const code = typeof record.code === "string" ? record.code : null;
    if (message || code) {
      return new ApiError(status, message ?? "Não foi possível concluir a solicitação.", [], {
        code,
        requestId: typeof record.request_id === "string" ? record.request_id : null,
        details: record.details && typeof record.details === "object" ? record.details as Record<string, unknown> : {},
      });
    }
  }

  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail?: unknown }).detail;
    if (typeof detail === "string") return new ApiError(status, detail);
    if (Array.isArray(detail)) {
      const issues = detail.map((item): ValidationIssue => {
        if (!item || typeof item !== "object") return { message: "Invalid value" };
        const entry = item as { loc?: unknown[]; msg?: string };
        const field = Array.isArray(entry.loc) ? String(entry.loc.at(-1) ?? "") : undefined;
        return { field, message: entry.msg ?? "Invalid value" };
      });
      return new ApiError(status, issues[0]?.message ?? "Invalid data", issues);
    }
  }

  const fallback = status === 429
    ? "Muitas tentativas. Aguarde um instante e tente novamente."
    : status >= 500
      ? "O serviço está indisponível no momento. Tente novamente."
      : "Não foi possível concluir a solicitação.";
  return new ApiError(status, fallback);
}

async function parseResponse(response: Response) {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return undefined;
  return response.json();
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = requestTimeoutMs) {
  if (timeoutMs <= 0) {
    try {
      return await fetch(input, init);
    } catch {
      if (init.signal?.aborted) throw new DOMException("The operation was aborted.", "AbortError");
      throw new ApiError(0, "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    }
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  const abortFromCaller = () => controller.abort();
  init.signal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch {
    if (init.signal?.aborted) throw new DOMException("The operation was aborted.", "AbortError");
    if (controller.signal.aborted) {
      throw new ApiError(408, "A conexão com o servidor demorou demais. Tente novamente.");
    }
    throw new ApiError(0, "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
  } finally {
    globalThis.clearTimeout(timeout);
    init.signal?.removeEventListener("abort", abortFromCaller);
  }
}

async function requestNewAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new ApiError(401, "Sessão expirada");

  const response = await fetchWithTimeout(buildApiUrl("/auth/refresh"), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const body = await parseResponse(response);
  if (!response.ok) throw normalizeError(response.status, body);
  const accessToken = (body as { access_token: string }).access_token;
  saveAccessToken(accessToken);
  return accessToken;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiFetchResponse(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { authenticated = true, retryAuth = true, timeoutMs, headers, ...init } = options;
  const accessToken = authenticated ? getAccessToken() : null;
  const response = await fetchWithTimeout(buildApiUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  }, timeoutMs);

  if (response.status === 401 && authenticated && retryAuth) {
    try {
      await refreshAccessToken();
      return apiFetchResponse(path, { ...options, retryAuth: false });
    } catch {
      clearSession();
      emitSessionExpired();
      throw new ApiError(401, "Sessão expirada");
    }
  }
  return response;
}

export async function apiFetch<TResponse>(path: string, options: ApiFetchOptions = {}): Promise<TResponse> {
  const response = await apiFetchResponse(path, options);
  const body = await parseResponse(response);
  if (!response.ok) {
    const error = normalizeError(response.status, body);
    if (response.status === 403 && /not verified|não verificado|email/i.test(error.detail) && typeof window !== "undefined") {
      window.dispatchEvent(new Event("rotina-ai:email-unverified"));
    }
    throw error;
  }
  return body as TResponse;
}
