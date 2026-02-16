"use client";

import { useCallback } from "react";

import { ThLineHeightOptions, ThSpacingSettingsKeys } from "@/preferences";

import { StatefulSettingsItemProps } from "./models/settings";

import { StatefulSwitch } from "./StatefulSwitch";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { useSpacingPresets } from "./Spacing/hooks/useSpacingPresets";
import { useLineHeight } from "./Spacing/hooks/useLineHeight";

import { useAppSelector } from "@/lib/hooks";

export const StatefulPublisherStyles = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();
  const publisherStyles = useAppSelector(state => state.settings.publisherStyles);

  const { getEffectiveSpacingValue, setPublisherStyles } = useSpacingPresets();

  const lineHeight = getEffectiveSpacingValue(ThSpacingSettingsKeys.lineHeight);
  const paragraphIndent = getEffectiveSpacingValue(ThSpacingSettingsKeys.paragraphIndent);
  const paragraphSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.paragraphSpacing);
  const letterSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.letterSpacing);
  const wordSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.wordSpacing);

  const lineHeightOptions = useLineHeight();

  const { submitPreferences } = useNavigator();

  const updatePreference = useCallback(async (isSelected: boolean) => {
    const values = isSelected ? 
    {
      lineHeight: null,
      paragraphIndent: null,
      paragraphSpacing: null,
      letterSpacing: null,
      wordSpacing: null
    } : 
    {
      lineHeight: lineHeight === ThLineHeightOptions.publisher 
        ? null 
        : lineHeightOptions[lineHeight as keyof typeof ThLineHeightOptions],
      paragraphIndent: paragraphIndent,
      paragraphSpacing: paragraphSpacing,
      letterSpacing: letterSpacing,
      wordSpacing: wordSpacing
    };
    await submitPreferences(values);

    setPublisherStyles(isSelected ? true : false);
  }, [submitPreferences, setPublisherStyles, lineHeight, paragraphIndent, paragraphSpacing, letterSpacing, wordSpacing, lineHeightOptions]);

  return(
    <>
    <StatefulSwitch 
      standalone={ standalone }
      label={ t("reader.preferences.publisherStyles.label") }
      onChange={ async (isSelected: boolean) => await updatePreference(isSelected) }
      isSelected={ publisherStyles }
    />
    </>
  )
}