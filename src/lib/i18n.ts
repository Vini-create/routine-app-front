export const supportedLanguages = [
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number]["code"];

export const defaultLanguage: SupportedLanguage = "en";
export const languageStorageKey = "rotina-ai-language";
export const languageCookieName = "rotina_locale";

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  if (typeof value !== "string") return false;
  return supportedLanguages.some((language) => language.code === value);
}

export function normalizeLanguage(value: unknown): SupportedLanguage | null {
  if (!value || typeof value !== "string") return null;

  if (isSupportedLanguage(value)) return value;

  const baseLanguage = value.split("-")[0];
  if (baseLanguage === "pt") return "pt-BR";
  if (isSupportedLanguage(baseLanguage)) return baseLanguage;

  return null;
}

export function getLanguageFromCookie(cookieValue: string): SupportedLanguage | null {
  const cookie = cookieValue
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${languageCookieName}=`));

  if (!cookie) return null;

  return normalizeLanguage(decodeURIComponent(cookie.split("=")[1] ?? ""));
}

export function getBrowserLanguage(): SupportedLanguage {
  if (typeof navigator === "undefined") return defaultLanguage;

  for (const language of navigator.languages ?? [navigator.language]) {
    const normalized = normalizeLanguage(language);
    if (normalized) return normalized;
  }

  return defaultLanguage;
}

export function resolveInitialLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return defaultLanguage;

  const cookieLanguage = getLanguageFromCookie(document.cookie);
  if (cookieLanguage) return cookieLanguage;

  const storedLanguage = normalizeLanguage(window.localStorage.getItem(languageStorageKey));
  if (storedLanguage) return storedLanguage;

  return getBrowserLanguage();
}

export function persistLanguage(language: SupportedLanguage) {
  // API_CONNECTION_POINT: after auth exists, also persist this preference with PATCH /users/me/preferences.
  window.localStorage.setItem(languageStorageKey, language);
  document.cookie = `${languageCookieName}=${encodeURIComponent(language)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
