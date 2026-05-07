"use client";

import { useMemo } from "react";

import { IEpubPreferences, TextAlignment } from "@readium/navigator";
import { ThPreferences } from "@/preferences";
import { ThLineHeightOptions, ThLayoutUI, ThSettingsKeys } from "@/preferences/models";
import { FontMetadata } from "@/preferences/services/fonts";
import { ThColorScheme } from "@/core/Hooks/useColorScheme";
import { ReadiumCSSSettings } from "@/core/Hooks/Epub/useEpubSettingsCache";
import { useSettingsComponentStatus } from "@/components/Settings/hooks/useSettingsComponentStatus";

import { useAppSelector } from "@/lib/hooks";

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
  const scriptMode = useAppSelector(state => state.publication.scriptMode);
  const isVerticalScript = scriptMode === "cjk-vertical" || scriptMode === "mongolian-vertical";

  const { isComponentUsed: isFontFamilyUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.fontFamily,
    publicationType: isFXL ? "fxl" : "reflow",
  });

  const { isComponentUsed: isFontSizeUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.zoom,
    publicationType: isFXL ? "fxl" : "reflow",
  });

  const { isComponentUsed: isFontWeightUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.fontWeight,
    publicationType: isFXL ? "fxl" : "reflow",
  });

  const { isComponentUsed: isColumnsUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.columns,
    publicationType: isFXL ? "fxl" : "reflow",
  });

  const { isComponentUsed: isLayoutUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.layout,
    publicationType: isFXL ? "fxl" : "reflow",
  });

  const { isComponentUsed: isHyphensUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.hyphens,
    publicationType: isFXL ? "fxl" : "reflow",
  });

  const { isComponentUsed: isLigaturesUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.ligatures,
    publicationType: isFXL ? "fxl" : "reflow",
  });

  const { isComponentUsed: isNoRubyUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.noRuby,
    publicationType: isFXL ? "fxl" : "reflow",
  });

  const { isComponentUsed: isLetterSpacingUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.letterSpacing,
    publicationType: isFXL ? "fxl" : "reflow",
  });

  const { isComponentUsed: isLineHeightUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.lineHeight,
    publicationType: isFXL ? "fxl" : "reflow",
  });

  const { isComponentUsed: isParagraphIndentUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.paragraphIndent,
    publicationType: isFXL ? "fxl" : "reflow",
  });

  const { isComponentUsed: isParagraphSpacingUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.paragraphSpacing,
    publicationType: isFXL ? "fxl" : "reflow",
  });

  const { isComponentUsed: isTextAlignUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.textAlign,
    publicationType: isFXL ? "fxl" : "reflow",
  });

  const { isComponentUsed: isTextNormalizeUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.textNormalize,
    publicationType: isFXL ? "fxl" : "reflow",
  });

  const { isComponentUsed: isWordSpacingUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.wordSpacing,
    publicationType: isFXL ? "fxl" : "reflow",
  });

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
      columnCount: !isColumnsUsed ? undefined : (settings.columnCount === "auto" ? null : Number(settings.columnCount)),
      constraint: initialConstraint,
      fontFamily: isFontFamilyUsed ? getFontMetadata(settings.fontFamily[fontLanguage] ?? "")?.fontStack || null : undefined,
      fontSize: isFontSizeUsed ? settings.fontSize : undefined,
      fontWeight: isFontWeightUsed ? settings.fontWeight : undefined,
      ligatures: isLigaturesUsed ? settings.ligatures : undefined,
      noRuby: isNoRubyUsed ? settings.noRuby : undefined,
      letterSpacing: (!isLetterSpacingUsed || settings.publisherStyles) ? undefined : settings.letterSpacing,
      lineHeight: (!isLineHeightUsed || settings.publisherStyles)
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
      paragraphIndent: (!isParagraphIndentUsed || settings.publisherStyles) ? undefined : settings.paragraphIndent,
      paragraphSpacing: (!isParagraphSpacingUsed || settings.publisherStyles) ? undefined : settings.paragraphSpacing,
      scroll: isVerticalScript ? true : (!isLayoutUsed ? undefined : settings.scroll),
      textAlign: isTextAlignUsed ? settings.textAlign as unknown as TextAlignment | null | undefined : undefined,
      hyphens: isHyphensUsed && settings.textAlign !== "publisher" ? settings.hyphens : undefined,
      textNormalization: isTextNormalizeUsed ? settings.textNormalization : undefined,
      wordSpacing: (!isWordSpacingUsed || settings.publisherStyles) ? undefined : settings.wordSpacing,
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
    reflowThemeKeys,
    isVerticalScript,
    isFontFamilyUsed,
    isFontSizeUsed,
    isFontWeightUsed,
    isColumnsUsed,
    isLayoutUsed,
    isHyphensUsed,
    isLigaturesUsed,
    isNoRubyUsed,
    isLetterSpacingUsed,
    isLineHeightUsed,
    isParagraphIndentUsed,
    isParagraphSpacingUsed,
    isTextAlignUsed,
    isTextNormalizeUsed,
    isWordSpacingUsed,
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
        ? (preferences.theming.icon.size || 24) * (isVerticalScript ? 3 : 5)
        : (preferences.theming.icon.size || 24),
      scrollPaddingLeft: preferences.typography.pageGutter,
      scrollPaddingRight: preferences.typography.pageGutter,
      experiments: preferences.experiments?.reflow || null
    };
  }, [isFXL, preferences, isVerticalScript]);

  return { epubPreferences, epubDefaults };
};
