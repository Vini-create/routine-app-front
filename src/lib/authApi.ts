import { apiFetch } from "./api";
import type { ApiLanguage, UserMe } from "./api-contracts";

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { email: string; password: string; display_name?: string; language?: ApiLanguage };
export type TokenResponse = { access_token: string; refresh_token: string; token_type: string };
export type MessageResponse = { message: string };

export const authApi = {
  login: (request: LoginRequest) => apiFetch<TokenResponse>("/auth/login", {
    method: "POST", authenticated: false, body: JSON.stringify(request),
  }),
  register: (request: RegisterRequest) => apiFetch<MessageResponse & { user_id: string }>("/auth/register", {
    method: "POST", authenticated: false, body: JSON.stringify(request),
  }),
  verifyEmail: (token: string) => apiFetch<MessageResponse>("/auth/verify-email", {
    method: "POST", authenticated: false, body: JSON.stringify({ token }),
  }),
  resendVerification: (email: string) => apiFetch<MessageResponse>("/auth/resend-verification", {
    method: "POST", authenticated: false, body: JSON.stringify({ email }),
  }),
  forgotPassword: (email: string) => apiFetch<MessageResponse>("/auth/forgot-password", {
    method: "POST", authenticated: false, body: JSON.stringify({ email }),
  }),
  resetPassword: (token: string, newPassword: string) => apiFetch<MessageResponse>("/auth/reset-password", {
    method: "POST", authenticated: false, body: JSON.stringify({ token, new_password: newPassword }),
  }),
  me: () => apiFetch<UserMe>("/auth/me"),
  updateMe: (request: { display_name?: string; language?: ApiLanguage }) => apiFetch<UserMe>("/auth/me", {
    method: "PATCH", body: JSON.stringify(request),
  }),
  logout: (refreshToken: string) => apiFetch<MessageResponse>("/auth/logout", {
    method: "POST", body: JSON.stringify({ refresh_token: refreshToken }),
  }),
  deleteAccount: () => apiFetch<MessageResponse>("/users/me", { method: "DELETE" }),
};
