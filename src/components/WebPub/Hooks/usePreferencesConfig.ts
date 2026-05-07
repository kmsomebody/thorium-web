"use client";

import { useMemo } from "react";

import { IWebPubPreferences, TextAlignment } from "@readium/navigator";
import { ThLineHeightOptions, ThSettingsKeys } from "@/preferences/models";
import { FontMetadata } from "@/preferences/services/fonts";
import { WebPubCSSSettings } from "@/core/Hooks/WebPub/useWebPubSettingsCache";
import { useSettingsComponentStatus } from "@/components/Settings/hooks/useSettingsComponentStatus";

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
  const { isComponentUsed: isFontFamilyUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.fontFamily,
    publicationType: "webpub",
  });

  const { isComponentUsed: isFontWeightUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.fontWeight,
    publicationType: "webpub",
  });

  const { isComponentUsed: isHyphensUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.hyphens,
    publicationType: "webpub",
  });

  const { isComponentUsed: isLigaturesUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.ligatures,
    publicationType: "webpub",
  });

  const { isComponentUsed: isNoRubyUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.noRuby,
    publicationType: "webpub",
  });

  const { isComponentUsed: isLetterSpacingUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.letterSpacing,
    publicationType: "webpub",
  });

  const { isComponentUsed: isLineHeightUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.lineHeight,
    publicationType: "webpub",
  });

  const { isComponentUsed: isParagraphIndentUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.paragraphIndent,
    publicationType: "webpub",
  });

  const { isComponentUsed: isParagraphSpacingUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.paragraphSpacing,
    publicationType: "webpub",
  });

  const { isComponentUsed: isTextAlignUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.textAlign,
    publicationType: "webpub",
  });

  const { isComponentUsed: isTextNormalizeUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.textNormalize,
    publicationType: "webpub",
  });

  const { isComponentUsed: isWordSpacingUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.wordSpacing,
    publicationType: "webpub",
  });

  const webPubPreferences = useMemo(() => {
    const preferences: IWebPubPreferences = {
      zoom: settings.zoom
    };

    if (hasDisplayTransformability) {
      if (isFontFamilyUsed) preferences.fontFamily = getFontMetadata(settings.fontFamily[fontLanguage] ?? "")?.fontStack || null;
      if (isFontWeightUsed) preferences.fontWeight = settings.fontWeight;
      if (isLigaturesUsed) preferences.ligatures = settings.ligatures;
      if (isNoRubyUsed) preferences.noRuby = settings.noRuby;
      if (isLetterSpacingUsed) preferences.letterSpacing = settings.letterSpacing;
      if (isLineHeightUsed) preferences.lineHeight = settings.lineHeight === null
        ? null
        : lineHeightOptions[settings.lineHeight];
      if (isParagraphIndentUsed) preferences.paragraphIndent = settings.paragraphIndent;
      if (isParagraphSpacingUsed) preferences.paragraphSpacing = settings.paragraphSpacing;
      if (isTextAlignUsed) preferences.textAlign = settings.textAlign as TextAlignment | null | undefined;
      if (isHyphensUsed && settings.textAlign !== "publisher") preferences.hyphens = settings.hyphens;
      if (isTextNormalizeUsed) preferences.textNormalization = settings.textNormalization;
      if (isWordSpacingUsed) preferences.wordSpacing = settings.wordSpacing;
    }

    return preferences;
  }, [
    settings,
    fontLanguage,
    hasDisplayTransformability,
    getFontMetadata,
    lineHeightOptions,
    isFontFamilyUsed,
    isFontWeightUsed,
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

  return { webPubPreferences };
};
