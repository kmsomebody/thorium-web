import { useTranslation } from "react-i18next";
import { DEFAULT_CONFIG } from "./config";

/**
 * Hook to access the i18n instance and translation functions
 * @param ns Optional additional namespace(s) to include alongside the default namespaces
 * @returns Translation functions and i18n instance
 */
export const useI18n = (ns?: string | string[]) => {
  // If no namespace provided, use both defaults with fallback
  // If namespace provided, use only that (override behavior)
  const { t: tRaw, i18n, ready } = useTranslation(ns || DEFAULT_CONFIG.ns as string[]);
  
  // Helper function to change language
  const changeLanguage = (lng: string) => {
    return i18n.changeLanguage(lng);
  };

  // Enhanced t function that searches both namespaces only when using defaults
  const t = (key: string, options?: any): string => {
    if (ns) {
      // If custom namespace provided, use it directly (no fallback)
      return tRaw(key, options) as string;
    } else {
      // If no namespace provided, search all default namespaces
      for (const namespace of DEFAULT_CONFIG.ns as string[]) {
        const result = tRaw(key, { ...options, ns: namespace });
        if (result !== key) return result as string;
      }
      return key;
    }
  };

  return {
    // Translation function
    t,
    // i18n instance
    i18n,
    // Whether translations are loaded
    ready,
    // Current language
    currentLanguage: i18n.language,
    // List of available languages
    languages: i18n.languages,
    // Function to change language
    changeLanguage
  };
};
