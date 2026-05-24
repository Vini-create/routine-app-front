import { apiFetch, useLocalFallbackApi } from "./api";

export type UpdateProfileRequest = {
  name: string;
  nickname: string;
  occupation: string;
  bio: string;
  wakeTime: string;
  sleepTime: string;
};

export async function updateProfile(request: UpdateProfileRequest) {
  // API_CONNECTION_POINT: later call PATCH /users/me/profile. Do not persist sensitive profile data in localStorage.
  if (!useLocalFallbackApi) {
    return apiFetch<{ ok: true }>("/users/me/profile", {
      method: "PATCH",
      body: JSON.stringify(request),
    });
  }

  return { ok: true };
}

export async function logout() {
  // API_CONNECTION_POINT: later call POST /auth/logout and clear the server session/token.
  if (!useLocalFallbackApi) {
    return apiFetch<{ ok: true }>("/auth/logout", { method: "POST" });
  }

  return { ok: true };
}

export async function deleteAccount() {
  // API_CONNECTION_POINT: later call DELETE /users/me after explicit confirmation.
  if (!useLocalFallbackApi) {
    return apiFetch<{ ok: true }>("/users/me", { method: "DELETE" });
  }

  return { ok: true };
}
