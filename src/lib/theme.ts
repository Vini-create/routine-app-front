export type ThemeMode = "dark" | "light";

export const themeStorageKey = "winperium-theme";
export const legacyThemeStorageKey = "alfred-theme";
export const themeCookieName = "winperium_theme";

export function normalizeTheme(value: unknown): ThemeMode | null {
  return value === "light" || value === "dark" ? value : null;
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";

  const storedTheme = normalizeTheme(
    window.localStorage.getItem(themeStorageKey) ??
      window.localStorage.getItem(legacyThemeStorageKey),
  );
  if (storedTheme) return storedTheme;

  const cookieTheme = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${themeCookieName}=`))
    ?.split("=")[1];

  return normalizeTheme(cookieTheme) ?? "dark";
}

export function persistTheme(theme: ThemeMode) {
  window.localStorage.setItem(themeStorageKey, theme);
  document.cookie = `${themeCookieName}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
