"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { translations, type Locale, type TranslationKey } from "./translations";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback: return French translations if no provider
    return {
      locale: "fr" as Locale,
      setLocale: () => {},
      t: (key: TranslationKey) => translations[key]?.fr || key,
    };
  }
  return ctx;
}

export { I18nContext, type Locale, type TranslationKey };
export { translations } from "./translations";
