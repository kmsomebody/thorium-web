"use client";

import { useCallback } from "react";

import { StatefulSettingsItemProps } from "../models/settings";
import { ThTextAlignOptions } from "@/preferences/models";

import { StatefulSwitch } from "../StatefulSwitch";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setHyphens } from "@/lib/settingsReducer";
import { setWebPubHyphens } from "@/lib/webPubSettingsReducer";

// TMP Component that is not meant to be implemented AS-IS, for testing purposes
export const StatefulHyphens = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";
  
  const hyphens = useAppSelector(state => isWebPub ? state.webPubSettings.hyphens : state.settings.hyphens) ?? false;
  const textAlign = useAppSelector(state => isWebPub ? state.webPubSettings.textAlign : state.settings.textAlign) ?? ThTextAlignOptions.publisher;

  const dispatch = useAppDispatch();
  
  const { getSetting, submitPreferences } = useNavigator();
  
  const updatePreference = useCallback(async (value: boolean) => {
    await submitPreferences({ hyphens: value });
    const effectiveSetting = getSetting("hyphens");
  
    if (isWebPub) {
      dispatch(setWebPubHyphens(effectiveSetting));
    } else {
      dispatch(setHyphens(effectiveSetting));
    }
  }, [isWebPub, submitPreferences, getSetting, dispatch]);

  return(
    <>
    <StatefulSwitch 
      standalone={ standalone }
      heading={ t("reader.preferences.hyphens.title") }
      label={ t("reader.preferences.hyphens.label") }
      onChange={ async (isSelected: boolean) => await updatePreference(isSelected) }
      isSelected={ hyphens ?? false }
      isDisabled={ textAlign === ThTextAlignOptions.publisher }
    />
    </>
  )
}