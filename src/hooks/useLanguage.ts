"use client";

import { useState } from "react";

type Language = "en" | "bn";

// Helper function to get initial language from localStorage
const getInitialLanguage = (): Language => {
  if (typeof window === "undefined") return "en"; // SSR safety

  const saved = localStorage.getItem("language") as Language;
  return saved && (saved === "en" || saved === "bn") ? saved : "en";
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  const toggleLanguage = () => {
    const newLang: Language = language === "en" ? "bn" : "en";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return {
    language,
    toggleLanguage,
    changeLanguage,
    isBengali: language === "bn",
    isEnglish: language === "en",
  };
};
