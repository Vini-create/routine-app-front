"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { messages } from "@/i18n/messages";
import {
  persistLanguage,
  resolveInitialLanguage,
  languageStorageKey,
  type SupportedLanguage,
} from "@/lib/i18n";

type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  messages: (typeof messages)[SupportedLanguage];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: React.ReactNode;
  initialLanguage: SupportedLanguage;
}) {
  const [language, setLanguageState] = useState<SupportedLanguage>(initialLanguage);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const preferredLanguage = resolveInitialLanguage();
      if (preferredLanguage !== initialLanguage) {
        setLanguageState(preferredLanguage);
        persistLanguage(preferredLanguage);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [initialLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== languageStorageKey) return;
      const nextLanguage = resolveInitialLanguage();
      setLanguageState(nextLanguage);
      document.documentElement.lang = nextLanguage;
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setLanguage = useCallback((nextLanguage: SupportedLanguage) => {
    setLanguageState(nextLanguage);
    persistLanguage(nextLanguage);
    document.documentElement.lang = nextLanguage;
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, messages: messages[language] }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslations<TNamespace extends keyof typeof messages.en>(namespace: TNamespace) {
  const context = useLanguage();

  return context.messages[namespace];
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
