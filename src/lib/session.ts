export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

const sessionStorageKey = "rotina-ai-auth-session";
const pendingVerificationEmailKey = "rotina-ai-pending-verification-email";
const legacySessionKey = "winperium-mvp-session";
const legacyUserDataKeys = [
  "winperium-user-goals",
  "rotina-ai-user-habits",
  "rotina-ai-routine-habit-records",
  "rotina-ai-routine-block-records",
  "rotina-ai-default-routine",
];

function readSession(): SessionTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(window.localStorage.getItem(sessionStorageKey) ?? "null") as Partial<SessionTokens> | null;
    if (!value?.accessToken || !value.refreshToken) return null;
    return { accessToken: value.accessToken, refreshToken: value.refreshToken };
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return readSession()?.accessToken ?? null;
}

export function getRefreshToken() {
  return readSession()?.refreshToken ?? null;
}

export function hasSession() {
  return Boolean(readSession());
}

export function saveSession(tokens: SessionTokens) {
  window.localStorage.setItem(sessionStorageKey, JSON.stringify(tokens));
  window.localStorage.removeItem(legacySessionKey);
}

export function saveAccessToken(accessToken: string) {
  const session = readSession();
  if (!session) return;
  saveSession({ ...session, accessToken });
}

export function clearLegacyUserData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(legacySessionKey);
  legacyUserDataKeys.forEach((key) => window.localStorage.removeItem(key));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(sessionStorageKey);
  clearLegacyUserData();
}

export function savePendingVerificationEmail(email: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(pendingVerificationEmailKey, email);
}

export function getPendingVerificationEmail() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(pendingVerificationEmailKey) ?? "";
}

export function clearPendingVerificationEmail() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(pendingVerificationEmailKey);
}
