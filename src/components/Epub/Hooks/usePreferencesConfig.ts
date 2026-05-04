"use client";

import { useMemo } from "react";

import { IEpubPreferences, TextAlignment } from "@readium/navigator";
import { ThPreferences } from "@/preferences";
import { ThLineHeightOptions, ThLayoutUI } from "@/preferences/models";
import { FontMetadata } from "@/preferences/services/fonts";
import { ThColorScheme } from "@/core/Hooks/useColorScheme";
import { ReadiumCSSSettings } from "@/core/Hooks/Epub/useEpubSettingsCache";

import { buildThemeObject } from "@/preferences/helpers/buildThemeObject";

interface UseEpubPreferencesConfigProps {
  isFXL: boolean;
  settings: ReadiumCSSSettings;
  colorScheme: ThColorScheme;
  fontLanguage: string;
  arrowsOccupySpace: boolean;
  arrowsWidth: React.RefObject<number>;
  preferences: ThPreferences;
  getFontMetadata: (fontFamily: string) => FontMetadata;
  lineHeightOptions: Record<ThLineHeightOptions, number | null>;
  fxlThemeKeys: string[];
  reflowThemeKeys: string[];
}

export const useEpubPreferencesConfig = ({
  isFXL,
  settings,
  colorScheme,
  fontLanguage,
  arrowsOccupySpace,
  arrowsWidth,
  preferences,
  getFontMetadata,
  lineHeightOptions,
  fxlThemeKeys,
  reflowThemeKeys,
}: UseEpubPreferencesConfigProps) => {
  const epubPreferences = useMemo(() => {
    if (isFXL) return {};

    const initialConstraint = arrowsOccupySpace ? arrowsWidth.current : 0;
    const themeKeys = isFXL ? fxlThemeKeys : reflowThemeKeys;
    const theme = settings.theme && themeKeys.includes(settings.theme) ? settings.theme : "auto";
    const themeProps = buildThemeObject<string>({
      theme: theme,
      themeKeys: preferences.theming.themes.keys,
      systemThemes: preferences.theming.themes.systemThemes,
      colorScheme: colorScheme
    });

    return {
      columnCount: settings.columnCount === "auto" ? null : Number(settings.columnCount),
      constraint: initialConstraint,
      fontFamily: getFontMetadata(settings.fontFamily[fontLanguage] ?? "")?.fontStack || null,
      fontSize: settings.fontSize,
      fontWeight: settings.fontWeight,
      hyphens: settings.hyphens,
      letterSpacing: settings.publisherStyles ? undefined : settings.letterSpacing,
      lineHeight: settings.publisherStyles 
        ? undefined 
        : settings.lineHeight === null 
          ? null 
          : lineHeightOptions[settings.lineHeight],
      optimalLineLength: settings.lineLength?.optimal != null 
        ? settings.lineLength.optimal 
        : undefined,
      maximalLineLength: settings.lineLength?.max?.isDisabled 
        ? null 
        : (settings.lineLength?.max?.chars != null) 
          ? settings.lineLength.max.chars 
          : undefined,
      minimalLineLength: settings.lineLength?.min?.isDisabled 
        ? null 
        : (settings.lineLength?.min?.chars != null) 
          ? settings.lineLength.min.chars 
          : undefined,
      paragraphIndent: settings.publisherStyles ? undefined : settings.paragraphIndent,
      paragraphSpacing: settings.publisherStyles ? undefined : settings.paragraphSpacing,
      scroll: settings.scroll,
      textAlign: settings.textAlign as unknown as TextAlignment | null | undefined,
      textNormalization: settings.textNormalization,
      wordSpacing: settings.publisherStyles ? undefined : settings.wordSpacing,
      ...themeProps
    } as IEpubPreferences;
  }, [
    isFXL,
    arrowsOccupySpace,
    arrowsWidth,
    settings,
    colorScheme,
    fontLanguage,
    preferences.theming.themes.keys,
    preferences.theming.themes.systemThemes,
    getFontMetadata,
    lineHeightOptions,
    fxlThemeKeys,
    reflowThemeKeys
  ]);

  const epubDefaults = useMemo(() => {
    if (isFXL) return {};

    return {
      maximalLineLength: preferences.typography.maximalLineLength,
      minimalLineLength: preferences.typography.minimalLineLength,
      optimalLineLength: preferences.typography.optimalLineLength,
      pageGutter: preferences.typography.pageGutter,
      scrollPaddingTop: preferences.theming.layout.ui?.reflow === ThLayoutUI.layered 
        ? (preferences.theming.icon.size || 24) * 3 
        : (preferences.theming.icon.size || 24),
      scrollPaddingBottom: preferences.theming.layout.ui?.reflow === ThLayoutUI.layered 
        ? (preferences.theming.icon.size || 24) * 5 
        : (preferences.theming.icon.size || 24),
      scrollPaddingLeft: preferences.typography.pageGutter,
      scrollPaddingRight: preferences.typography.pageGutter,
      experiments: preferences.experiments?.reflow || null
    };
  }, [isFXL, preferences]);

  return { epubPreferences, epubDefaults };
};
