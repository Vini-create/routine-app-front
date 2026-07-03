import { apiFetch } from "./api";
import type { ApiLanguage, UserMe } from "./api-contracts";

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { email: string; password: string; display_name?: string; language?: ApiLanguage };
export type TokenResponse = { access_token: string; refresh_token: string; token_type: string };
export type LoginChallengeResponse = { challenge_id: string; masked_email: string; expires_at: string };
export type GoogleChallengeResponse = { challenge_id: string; nonce: string; expires_at: string };
export type MessageResponse = { message: string };

export const authApi = {
  login: (request: LoginRequest) => apiFetch<LoginChallengeResponse>("/auth/login", {
    method: "POST", authenticated: false, body: JSON.stringify(request),
  }),
  verifyLogin: (challengeId: string, code: string) => apiFetch<TokenResponse>("/auth/login/verify", {
    method: "POST", authenticated: false, body: JSON.stringify({ challenge_id: challengeId, code }),
  }),
  resendLogin: (challengeId: string) => apiFetch<LoginChallengeResponse>("/auth/login/resend", {
    method: "POST", authenticated: false, timeoutMs: 30_000, body: JSON.stringify({ challenge_id: challengeId }),
  }),
  googleChallenge: () => apiFetch<GoogleChallengeResponse>("/auth/google/challenge", {
    method: "POST", authenticated: false,
  }),
  googleLogin: (challengeId: string, credential: string, language: ApiLanguage) => apiFetch<TokenResponse>("/auth/google", {
    method: "POST", authenticated: false, body: JSON.stringify({ challenge_id: challengeId, credential, language }),
  }),
  register: (request: RegisterRequest) => apiFetch<MessageResponse & { user_id: string }>("/auth/register", {
    method: "POST", authenticated: false, timeoutMs: 30_000, body: JSON.stringify(request),
  }),
  verifyEmail: (token: string) => apiFetch<MessageResponse>("/auth/verify-email", {
    method: "POST", authenticated: false, body: JSON.stringify({ token }),
  }),
  resendVerification: (email: string) => apiFetch<MessageResponse>("/auth/resend-verification", {
    method: "POST", authenticated: false, timeoutMs: 30_000, body: JSON.stringify({ email }),
  }),
  forgotPassword: (email: string) => apiFetch<MessageResponse>("/auth/forgot-password", {
    method: "POST", authenticated: false, timeoutMs: 30_000, body: JSON.stringify({ email }),
  }),
  resetPassword: (token: string, newPassword: string) => apiFetch<MessageResponse>("/auth/reset-password", {
    method: "POST", authenticated: false, timeoutMs: 30_000, body: JSON.stringify({ token, new_password: newPassword }),
  }),
  me: () => apiFetch<UserMe>("/auth/me"),
  updateMe: (request: { display_name?: string; language?: ApiLanguage }) => apiFetch<UserMe>("/auth/me", {
    method: "PATCH", body: JSON.stringify(request),
  }),
  changePassword: (currentPassword: string, newPassword: string) => apiFetch<MessageResponse>("/auth/change-password", {
    method: "POST", body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  }),
  logout: (refreshToken: string) => apiFetch<MessageResponse>("/auth/logout", {
    method: "POST", body: JSON.stringify({ refresh_token: refreshToken }),
  }),
  deleteAccount: (password: string) => apiFetch<MessageResponse>("/users/me", {
    method: "DELETE", body: JSON.stringify({ password }),
  }),
};
