"use client";

import { supportedLanguages } from "@/lib/i18n";
import { isSupportedLanguage } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";
import { Select } from "@/components/ui/Form";

export function LanguageSelect({ name = "language" }: { name?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <Select
      name={name}
      value={language}
      onChange={(event) => {
        if (isSupportedLanguage(event.target.value)) {
          setLanguage(event.target.value);
        }
      }}
    >
      {supportedLanguages.map((item) => (
        <option key={item.code} value={item.code}>
          {item.label}
        </option>
      ))}
    </Select>
  );
}
