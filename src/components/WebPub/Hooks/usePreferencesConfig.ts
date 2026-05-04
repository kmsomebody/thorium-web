"use client";

import { useMemo } from "react";

import { IWebPubPreferences, TextAlignment } from "@readium/navigator";
import { ThLineHeightOptions } from "@/preferences/models";
import { FontMetadata } from "@/preferences/services/fonts";
import { WebPubCSSSettings } from "@/core/Hooks/WebPub/useWebPubSettingsCache";

interface UseWebPubPreferencesConfigProps {
  settings: WebPubCSSSettings;
  fontLanguage: string;
  hasDisplayTransformability: boolean;
  getFontMetadata: (fontFamily: string) => FontMetadata;
  lineHeightOptions: Record<ThLineHeightOptions, number | null>;
}

export const useWebPubPreferencesConfig = ({
  settings,
  fontLanguage,
  hasDisplayTransformability,
  getFontMetadata,
  lineHeightOptions,
}: UseWebPubPreferencesConfigProps) => {
  const webPubPreferences = useMemo(() => {
    const preferences: IWebPubPreferences = {
      zoom: settings.zoom
    };

    if (hasDisplayTransformability) {
      preferences.fontFamily = getFontMetadata(settings.fontFamily[fontLanguage] ?? "")?.fontStack || null;
      preferences.fontWeight = settings.fontWeight;
      preferences.hyphens = settings.hyphens;
      preferences.letterSpacing = settings.letterSpacing;
      preferences.lineHeight = settings.lineHeight === null 
        ? null 
        : lineHeightOptions[settings.lineHeight];
      preferences.paragraphIndent = settings.paragraphIndent;
      preferences.paragraphSpacing = settings.paragraphSpacing;
      preferences.textAlign = settings.textAlign as TextAlignment | null | undefined;
      preferences.textNormalization = settings.textNormalization;
      preferences.wordSpacing = settings.wordSpacing;
    }

    return preferences;
  }, [
    settings,
    fontLanguage,
    hasDisplayTransformability,
    getFontMetadata,
    lineHeightOptions,
  ]);

  return { webPubPreferences };
};
