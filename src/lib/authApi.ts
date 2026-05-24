import { apiFetch, useLocalFallbackApi } from "./api";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  language: string;
};

export type AuthResponse = {
  accessToken?: string;
  refreshToken?: string;
};

export async function login(request: LoginRequest): Promise<AuthResponse> {
  // API_CONNECTION_POINT: later call POST /auth/login and store the returned session securely.
  if (!useLocalFallbackApi) {
    return apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  return {};
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  // API_CONNECTION_POINT: later call POST /auth/register and continue to onboarding.
  if (!useLocalFallbackApi) {
    return apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  return {};
}
