"use client";

import { useCallback, useMemo } from "react";

import { ThLineHeightOptions, ThSpacingSettingsKeys, ThSettingsKeys } from "@/preferences";

import { StatefulSettingsItemProps } from "../models/settings";

import BookIcon from "../assets/icons/book.svg";
import SmallIcon from "./assets/icons/density_small.svg";
import MediumIcon from "./assets/icons/density_medium.svg";
import LargeIcon from "./assets/icons/density_large.svg";

import { StatefulRadioGroup } from "../StatefulRadioGroup";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { usePreferences } from "@/preferences/hooks/usePreferences";

import { useAppSelector } from "@/lib/hooks";
import { useLineHeight } from "./hooks/useLineHeight";
import { useSpacingPresets } from "./hooks/useSpacingPresets";

export const StatefulLineHeight = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();
  const { preferences } = usePreferences();

  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";

  const publisherStyles = useAppSelector(state => isWebPub ? state.webPubSettings.publisherStyles : state.settings.publisherStyles) ?? true;

  const { getSetting, submitPreferences } = useNavigator();

  const { getEffectiveSpacingValue, setLineHeight } = useSpacingPresets();

  const lineHeight = getEffectiveSpacingValue(ThSpacingSettingsKeys.lineHeight);

  const lineHeightOptions = useLineHeight();

  // Dynamically build items array based on allowUnset preference
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
    ];

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
  }, [preferences.settings.keys, t]);

  const updatePreference = useCallback(async (value: string) => {
    const computedValue = value === ThLineHeightOptions.publisher
      ? null
      : lineHeightOptions[value as keyof typeof ThLineHeightOptions];

    await submitPreferences({
      lineHeight: computedValue
    });

    const currentLineHeight = getSetting("lineHeight");
    const currentDisplayLineHeightOption = Object.entries(lineHeightOptions).find(([key, value]) => value === currentLineHeight)?.[0] as ThLineHeightOptions;

    setLineHeight(currentDisplayLineHeightOption);
  }, [submitPreferences, getSetting, setLineHeight, lineHeightOptions]);

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