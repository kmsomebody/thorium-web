"use client";

import { useCallback, useMemo } from "react";

import { ThLineHeightOptions, ThSpacingSettingsKeys, ThSettingsKeys } from "@/preferences";
import { SETTINGS_KEY_TO_PREFERENCE } from "../helpers/settingsKeyMapping";

import { StatefulSettingsItemProps } from "../models/settings";

import BookIcon from "../assets/icons/book.svg";
import SmallIcon from "./assets/icons/density_small.svg";
import MediumIcon from "./assets/icons/density_medium.svg";
import LargeIcon from "./assets/icons/density_large.svg";

import { StatefulRadioGroup } from "../StatefulRadioGroup";

import { useNavigator } from "@/core/Navigator";
import { EpubPreferencesEditor } from "@readium/navigator";
import { useI18n } from "@/i18n/useI18n";
import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useEffectiveRange } from "../hooks/useEffectiveRange";

import { useAppSelector } from "@/lib/hooks";
import { useLineHeight } from "./hooks/useLineHeight";
import { useSpacingPresets } from "./hooks/useSpacingPresets";
import { useReaderSetting } from "../hooks/useReaderSetting";

export const StatefulLineHeight = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();
  const { preferences } = usePreferences();

  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";

  const publisherStyles = useReaderSetting("publisherStyles");

  const { getSetting, submitPreferences, preferencesEditor } = useNavigator().visual;

  const prefKey = SETTINGS_KEY_TO_PREFERENCE[ThSettingsKeys.lineHeight];

  const { getEffectiveSpacingValue, setLineHeight } = useSpacingPresets();

  const lineHeight = getEffectiveSpacingValue(ThSpacingSettingsKeys.lineHeight);

  const lineHeightOptions = useLineHeight();

  const lineHeightNumericValues = useMemo(
    () => Object.values(lineHeightOptions).filter((v): v is number => v !== null),
    [lineHeightOptions]
  );

  const { presets: effectivePresets } = useEffectiveRange(
    [Math.min(...lineHeightNumericValues), Math.max(...lineHeightNumericValues)],
    (preferencesEditor as EpubPreferencesEditor | undefined)?.lineHeight?.supportedRange,
    lineHeightNumericValues
  );

  // Dynamically build items array based on allowUnset preference and navigator supported range
  const items = useMemo(() => {
    const baseItems = [
      {
        id: ThLineHeightOptions.small,
        icon: SmallIcon,
        label: t("reader.preferences.lineHeight.small"),
        value: ThLineHeightOptions.small
      },
      {
        id: ThLineHeightOptions.medium,
        icon: MediumIcon,
        label: t("reader.preferences.lineHeight.medium"),
        value: ThLineHeightOptions.medium
      },
      {
        id: ThLineHeightOptions.large,
        icon: LargeIcon,
        label: t("reader.preferences.lineHeight.large"),
        value: ThLineHeightOptions.large
      },
    ].filter(item => {
      const v = lineHeightOptions[item.id];
      return effectivePresets === undefined || effectivePresets.includes(v);
    });

    // Only add publisher option if allowUnset is true
    if (preferences.settings.keys[ThSettingsKeys.lineHeight].allowUnset !== false) {
      baseItems.unshift({
        id: ThLineHeightOptions.publisher,
        icon: BookIcon,
        label: t("reader.preferences.lineHeight.default"),
        value: ThLineHeightOptions.publisher
      });
    }

    return baseItems;
  }, [preferences.settings.keys, lineHeightOptions, effectivePresets, t]);

  const updatePreference = useCallback(async (value: string) => {
    const computedValue = value === ThLineHeightOptions.publisher
      ? null
      : lineHeightOptions[value as keyof typeof ThLineHeightOptions];
    await submitPreferences({
      [prefKey]: computedValue
    });

    const currentLineHeight = getSetting(prefKey);
    const currentDisplayLineHeightOption = Object.entries(lineHeightOptions).find(([_key, value]) => value === currentLineHeight)?.[0] as ThLineHeightOptions;

    setLineHeight(currentDisplayLineHeightOption);
  }, [prefKey, submitPreferences, getSetting, setLineHeight, lineHeightOptions]);

  return (
    <>
    <StatefulRadioGroup
      standalone={ standalone }
      label={ t("reader.preferences.lineHeight.title") }
      orientation="horizontal"
      value={ !isWebPub && publisherStyles ? ThLineHeightOptions.publisher : lineHeight }
      onChange={ async (val: string) => await updatePreference(val) }
      items={ items }
    />
    </>
  );
}
