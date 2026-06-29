"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  getStoredTheme,
  legacyThemeStorageKey,
  persistTheme,
  themeStorageKey,
  type ThemeMode,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme: ThemeMode;
}) {
  const [theme, setThemeState] = useState<ThemeMode>(initialTheme);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedTheme = getStoredTheme();
      if (storedTheme !== initialTheme) {
        setThemeState(storedTheme);
        persistTheme(storedTheme);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [initialTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== themeStorageKey && event.key !== legacyThemeStorageKey) return;
      const nextTheme = getStoredTheme();
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function setTheme(nextTheme: ThemeMode) {
    setThemeState(nextTheme);
    persistTheme(nextTheme);
    applyTheme(nextTheme);
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
