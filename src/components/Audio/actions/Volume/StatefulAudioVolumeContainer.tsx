"use client";

import { useCallback } from "react";

import { ThAudioKeys, ThAudioActionKeys, ThSheetTypes } from "@/preferences/models";
import { ThSlider } from "@/core/Components/Settings/ThSlider";
import { StatefulActionContainerProps } from "../../../Actions/models/actions";

import volumeStyles from "./assets/styles/thorium-web.volume.module.css";

import { useNavigator } from "@/core/Navigator";
import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";
import { useI18n } from "@/i18n/useI18n";
import { useEffectiveRange } from "../../../Settings/hooks/useEffectiveRange";
import { useDocking } from "../../../Docking/hooks/useDocking";
import { StatefulSheetWrapper } from "@/components/Sheets/StatefulSheetWrapper";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setVolume } from "@/lib/audioSettingsReducer";
import { setActionOpen } from "@/lib/actionsReducer";

export const StatefulAudioVolumeContainer = ({ triggerRef, placement = "top" }: StatefulActionContainerProps) => {
  const volume = useAppSelector(state => state.audioSettings.volume);
  const isOpen = useAppSelector(state => state.actions.keys[ThAudioActionKeys.volume]?.isOpen ?? false);

  const { t } = useI18n();
  const { preferences } = useAudioPreferences();

  const dispatch = useAppDispatch();
  const { submitPreferences, getSetting, preferencesEditor } = useNavigator().media;

  const config = preferences.settings.keys[ThAudioKeys.volume];
  const { range } = useEffectiveRange(config.range, preferencesEditor?.volume?.supportedRange);

  const updatePreference = useCallback(async (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    await submitPreferences({ volume: val });
    const effectiveVolume = getSetting("volume");
    dispatch(setVolume(effectiveVolume));
  }, [submitPreferences, getSetting, dispatch]);

  const docking = useDocking(ThAudioActionKeys.volume);

  const sliderOrientation = (docking.sheetType === ThSheetTypes.popover || docking.sheetType === ThSheetTypes.compactPopover)
    ? "vertical"
    : "horizontal";

  const setOpen = useCallback((open: boolean) => {
    dispatch(setActionOpen({ key: ThAudioActionKeys.volume, isOpen: open }));
  }, [dispatch]);

  return (
    <StatefulSheetWrapper
      sheetType={ docking.sheetType }
      sheetProps={ {
        id: ThAudioActionKeys.volume,
        triggerRef,
        heading: t("reader.playback.preferences.audio.volume"),
        className: volumeStyles.wrapper,
        placement,
        isOpen,
        onOpenChange: setOpen,
        onClosePress: () => setOpen(false),
        docker: docking.getDocker(),
      } }
    >
      <ThSlider
        aria-label={ t("reader.playback.preferences.audio.volume") }
        className={ volumeStyles.slider }
        orientation={ sliderOrientation }
        range={ range }
        step={ config.step }
        value={ volume }
        onChange={ updatePreference }
        compounds={ {
          track: { className: volumeStyles.sliderTrack },
          thumb: { className: volumeStyles.sliderThumb },
          output: { style: () => ({ display: "none" }) }
        } }
      />
    </StatefulSheetWrapper>
  );
};
