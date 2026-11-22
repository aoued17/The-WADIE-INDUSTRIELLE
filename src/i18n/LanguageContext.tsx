import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Language } from '../types';
import { getTranslations } from './translations';

interface LanguageContextValue {
  lang: Language;
  isRtl: boolean;
  setLang: (next: Language) => void;
  toggleLang: () => void;
  t: ReturnType<typeof getTranslations>;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readLangCookie(): Language {
  if (typeof document === 'undefined') return 'ar';
  const match = document.cookie.match(/(?:^|;\s*)wadie_lang=(ar|fr)(?:;|$)/);
  return match?.[1] === 'fr' ? 'fr' : 'ar';
}

function writeLangCookie(lang: Language) {
  if (typeof document === 'undefined') return;
  document.cookie = `wadie_lang=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => readLangCookie());

  const setLang = (next: Language) => {
    setLangState(next);
    writeLangCookie(next);
  };

  const toggleLang = () => {
    setLang(lang === 'ar' ? 'fr' : 'ar');
  };

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const value: LanguageContextValue = {
    lang,
    isRtl: lang === 'ar',
    setLang,
    toggleLang,
    t: getTranslations(lang),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
