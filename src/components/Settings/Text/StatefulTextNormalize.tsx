"use client";

import { useCallback } from "react";

import { StatefulSettingsItemProps } from "../models/settings";

import { StatefulSwitch } from "../StatefulSwitch";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setTextNormalization } from "@/lib/settingsReducer";
import { setWebPubTextNormalization } from "@/lib/webPubSettingsReducer";

// TMP Component that is not meant to be implemented AS-IS, for testing purposes
export const StatefulTextNormalize = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";
  
  const textNormalization = useAppSelector(state => isWebPub ? state.webPubSettings.textNormalization : state.settings.textNormalization) ?? false;
  const dispatch = useAppDispatch();

  const { getSetting, submitPreferences } = useNavigator();

  const updatePreference = useCallback(async (value: boolean) => {
    await submitPreferences({ textNormalization: value });
    const effectiveSetting = getSetting("textNormalization");

    if (isWebPub) {
      dispatch(setWebPubTextNormalization(effectiveSetting));
    } else {
      dispatch(setTextNormalization(effectiveSetting));
    }
  }, [isWebPub, submitPreferences, getSetting, dispatch]);

  return(
    <>
    <StatefulSwitch 
      standalone={ standalone }
      heading={ t("reader.preferences.textNormalization.title") }
      label={ t("reader.preferences.textNormalization.label") }
      onChange={ async (isSelected: boolean) => await updatePreference(isSelected) }
      isSelected={ textNormalization ?? false }
    />
    </>
  )
}