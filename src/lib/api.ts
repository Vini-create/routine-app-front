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

  constructor(status: number, detail: string, issues: ValidationIssue[] = []) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.issues = issues;
  }
}

type ApiFetchOptions = RequestInit & {
  authenticated?: boolean;
  retryAuth?: boolean;
};

let refreshPromise: Promise<string> | null = null;

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

async function requestNewAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new ApiError(401, "Sessão expirada");

  const response = await fetch(buildApiUrl("/auth/refresh"), {
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

export async function apiFetch<TResponse>(path: string, options: ApiFetchOptions = {}): Promise<TResponse> {
  const { authenticated = true, retryAuth = true, headers, ...init } = options;
  const accessToken = authenticated ? getAccessToken() : null;
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

  if (response.status === 401 && authenticated && retryAuth) {
    try {
      await refreshAccessToken();
      return apiFetch<TResponse>(path, { ...options, retryAuth: false });
    } catch {
      clearSession();
      emitSessionExpired();
      throw new ApiError(401, "Sessão expirada");
    }
  }

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
