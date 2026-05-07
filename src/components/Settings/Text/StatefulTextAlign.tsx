"use client";

import { useCallback } from "react";

import { ThTextAlignOptions, ThTextSettingsKeys, ThSettingsKeys } from "@/preferences/models";
import { StatefulSettingsItemProps } from "../models/settings";
import { TextAlignment } from "@readium/navigator";
import { SETTINGS_KEY_TO_PREFERENCE } from "../helpers/settingsKeyMapping";

import BookIcon from "../assets/icons/book.svg";
import LeftAlignIcon from "./assets/icons/format_align_left.svg";
import RightAlignIcon from "./assets/icons/format_align_right.svg";
import JustifyIcon from "./assets/icons/format_align_justify.svg";

import { StatefulRadioGroup } from "../StatefulRadioGroup";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { useSettingsComponentStatus } from "../hooks/useSettingsComponentStatus";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useReaderSetting } from "../hooks/useReaderSetting";
import { setTextAlign, setHyphens } from "@/lib/settingsReducer";
import { setWebPubHyphens, setWebPubTextAlign } from "@/lib/webPubSettingsReducer";

export const StatefulTextAlign = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";

  const isRTL = useAppSelector(state => state.publication.isRTL);
  const textAlign = useReaderSetting("textAlign");
  const dispatch = useAppDispatch();

  const { getSetting, submitPreferences } = useNavigator().visual;

  const hyphensPrefKey = SETTINGS_KEY_TO_PREFERENCE[ThSettingsKeys.hyphens];
  const textAlignPrefKey = SETTINGS_KEY_TO_PREFERENCE[ThSettingsKeys.textAlign];

  // Check if hyphens plugin is being used
  const publicationType = isWebPub ? "webpub" : "reflow";
  const { isComponentUsed: isHyphensUsed } = useSettingsComponentStatus({
    settingsKey: ThTextSettingsKeys.hyphens,
    publicationType
  });

  const items = [
    {
      id: ThTextAlignOptions.publisher,
      icon: BookIcon,
      label: t("reader.preferences.textAlign.default"), 
      value: ThTextAlignOptions.publisher 
    },
    {
      id: ThTextAlignOptions.start,
      icon: isRTL ? RightAlignIcon : LeftAlignIcon,
      label: isRTL ? t("reader.preferences.textAlign.right") : t("reader.preferences.textAlign.left"), 
      value: ThTextAlignOptions.start 
    },
    {
      id: ThTextAlignOptions.justify,
      icon: JustifyIcon,
      label: t("reader.preferences.textAlign.justify"), 
      value: ThTextAlignOptions.justify 
    }
  ];

  const updatePreference = useCallback(async (value: string) => {
    const textAlign: TextAlignment | null = value === ThTextAlignOptions.publisher
      ? null
      : value === ThTextAlignOptions.start
        ? TextAlignment.start
        : TextAlignment.justify;

    const currentHyphens = getSetting(hyphensPrefKey) as boolean | undefined | null;

    const hyphens = textAlign === null
      ? null
      : (currentHyphens ?? textAlign === TextAlignment.justify);
    const preferencesToSubmit: any = {
      [textAlignPrefKey]: textAlign
    };

    // Only include hyphens if the plugin is being used
    if (isHyphensUsed) {
      preferencesToSubmit[hyphensPrefKey] = hyphens;
    }

    await submitPreferences(preferencesToSubmit);

    const textAlignSetting = getSetting(textAlignPrefKey) as TextAlignment | null;
    const textAlignValue = textAlignSetting === null ? ThTextAlignOptions.publisher : textAlignSetting as unknown as ThTextAlignOptions;
    const effectiveHyphens = getSetting(hyphensPrefKey);

    if (isWebPub) {
      dispatch(setWebPubTextAlign(textAlignValue));
      dispatch(setWebPubHyphens(effectiveHyphens));
    } else {
      dispatch(setTextAlign(textAlignValue));
      dispatch(setHyphens(effectiveHyphens));
    }
  }, [hyphensPrefKey, textAlignPrefKey, isWebPub, getSetting, submitPreferences, dispatch, isHyphensUsed]);

  return (
    <>
    <StatefulRadioGroup 
      standalone={ standalone } 
      label={ t("reader.preferences.textAlign.title") }
      orientation="horizontal" 
      value={ textAlign } 
      onChange={ async (val: string) => await updatePreference(val) }
      items={ items }
    />
    </>
  );
}