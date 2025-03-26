import React, { createContext, useState, useContext, useEffect } from 'react';
import { no, en } from './translations';

// Oppretter språkkonteksten
export const LanguageContext = createContext();

// Tilgjengelige språk
export const languages = {
  no: 'Norsk',
  en: 'English'
};

// Language Provider komponent
export const LanguageProvider = ({ children }) => {
  // Henter lagret språkvalg eller bruker norsk som standard
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'no';
  });
  
  // Henter oversettelser basert på valgt språk
  const [translations, setTranslations] = useState(language === 'no' ? no : en);
  
  // Funksjon for å bytte språk
  const changeLanguage = (lang) => {
    setLanguage(lang);
    setTranslations(lang === 'no' ? no : en);
    localStorage.setItem('language', lang);
  };
  
  // Oppdaterer oversettelser når språk endres
  useEffect(() => {
    setTranslations(language === 'no' ? no : en);
  }, [language]);
  
  // Kontekstverdien som vil være tilgjengelig for komponenter
  const contextValue = {
    language,
    translations,
    changeLanguage
  };
  
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for enkel tilgang til språkkonteksten
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 