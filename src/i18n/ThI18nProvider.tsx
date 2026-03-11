"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { i18n, initI18n } from "./config";
import { InitOptions } from "i18next";
import { usePreferences } from "@/preferences";

export type ThI18nProviderProps = {
  children: ReactNode;
} & Partial<InitOptions>;

export const ThI18nProvider = ({
  children,
  ...options
}: ThI18nProviderProps) => {
  const { preferences } = usePreferences();
  const [isInitialized, setIsInitialized] = useState(i18n.isInitialized);
  
  useEffect(() => {
    if (!i18n.isInitialized) {      
      initI18n({
        ...options,
        lng: preferences?.locale || options.lng,
      }).then(() => setIsInitialized(true));
    }
  });

  useEffect(() => {
    if (isInitialized && preferences?.locale) {
      i18n.changeLanguage(preferences.locale);
    }
  }, [preferences?.locale, isInitialized]);

  if (!isInitialized) {
    return null;
  }

  return <I18nextProvider i18n={ i18n }>{ children }</I18nextProvider>;
};

export default ThI18nProvider;
