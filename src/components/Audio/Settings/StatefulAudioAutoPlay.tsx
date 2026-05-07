"use client";

import { useCallback } from "react";

import { StatefulSwitch } from "../../Settings/StatefulSwitch";

import { useI18n } from "@/i18n/useI18n";
import { useNavigator } from "@/core/Navigator";

import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { setAutoPlay } from "@/lib/audioSettingsReducer";

export interface StatefulAudioAutoPlayProps {
  standalone?: boolean;
}

export const StatefulAudioAutoPlay = ({
  standalone = true
}: StatefulAudioAutoPlayProps) => {
  const { t } = useI18n();

  const autoPlay = useAppSelector(state => state.audioSettings.autoPlay);
  const dispatch = useAppDispatch();
  const { submitPreferences, getSetting } = useNavigator().media;

  const updatePreference = useCallback(async (isSelected: boolean) => {
    await submitPreferences({ autoPlay: isSelected });
    const effectiveAutoPlay = getSetting("autoPlay");
    dispatch(setAutoPlay(effectiveAutoPlay));
  }, [submitPreferences, getSetting, dispatch]);

  return (
    <StatefulSwitch
      standalone={ standalone }
      heading={ t("audio.settings.autoPlay.title") }
      label={ t("audio.settings.autoPlay.label") }
      isSelected={ autoPlay }
      onChange={ updatePreference }
    />
  );
};
