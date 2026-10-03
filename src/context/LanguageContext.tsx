import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, TranslationKey, Language } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en'; // Defaulting to English
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    // Add class for specific font overriding if necessary
    if (language === 'bn') {
      document.body.classList.add('font-bengali');
    } else {
      document.body.classList.remove('font-bengali');
    }
  }, [language]);

  const t = (key: TranslationKey) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
