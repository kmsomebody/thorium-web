"use client";

import { useCallback, useMemo } from "react";

import { ListBox, ListBoxItem, Popover, Select } from "react-aria-components";

import SpeedIcon from "../assets/icons/speed.svg";

import { ThAudioKeys } from "@/preferences/models";
import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";

import audioStyles from "../assets/styles/thorium-web.audioControls.module.css";

import { useNavigator } from "@/core/Navigator/hooks";
import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setPlaybackRate } from "@/lib/audioSettingsReducer";

export const StatefulAudioPlaybackRate = ({ isDisabled }: { isDisabled: boolean }) => {
  const { t } = useI18n();
  const { preferences } = usePreferences();
  const playbackRate = useAppSelector(state => state.audioSettings.playbackRate);
  const dispatch = useAppDispatch();
  const { submitPreferences, getSetting } = useNavigator().media;

  const config = preferences.audio.keys[ThAudioKeys.playbackRate];

  const values = useMemo(() => {
    const min = Math.min(...config.range);
    const max = Math.max(...config.range);
    const count = Math.round((max - min) / config.step) + 1;
    return Array.from({ length: count }, (_, i) =>
      Math.round((min + i * config.step) * 100) / 100
    );
  }, [config.range, config.step]);

  const updatePreference = useCallback(async (key: string) => {
    const value = Number(key);
    await submitPreferences({ playbackRate: value });
    const effectiveRate = getSetting("playbackRate");
    dispatch(setPlaybackRate(effectiveRate));
  }, [submitPreferences, getSetting, dispatch]);

  return (
    <Select
      aria-label={ t("audio.settings.playbackRate") }
      isDisabled={ isDisabled }
      selectedKey={ String(playbackRate) }
      onSelectionChange={ (key) => updatePreference(String(key)) }
    >
      <StatefulActionIcon
        tooltipLabel={ t("audio.settings.playbackRate") }
        placement="bottom"
        className={ audioStyles.audioPlaybackRateButton }
      >
        <SpeedIcon aria-hidden="true" focusable="false" />
        <span className={ audioStyles.audioPlaybackRateLabel } aria-hidden="true">{ playbackRate }×</span>
      </StatefulActionIcon>
      <Popover
        placement="top"
        className={ audioStyles.audioControlPopover }
      >
        <ListBox
          className={ audioStyles.audioPlaybackRateListbox }
        >
          { values.map((v) => (
            <ListBoxItem
              key={ String(v) }
              id={ String(v) }
              className={ audioStyles.audioPlaybackRateListboxItem }
            >
              { v }×
            </ListBoxItem>
          )) }
        </ListBox>
      </Popover>
    </Select>
  );
};
