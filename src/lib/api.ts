export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
export const useLocalFallbackApi = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false" || !apiBaseUrl;

export function buildApiUrl(path: string) {
  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  // API_CONNECTION_POINT: all future REST requests should pass through this helper.
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}
