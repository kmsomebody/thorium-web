"use client";

import { useCallback, useMemo, useRef } from "react";

import { Dialog, Popover } from "react-aria-components";

import VolumeUpIcon from "../assets/icons/volume_up.svg";
import VolumeDownIcon from "../assets/icons/volume_down.svg";
import VolumeMuteIcon from "../assets/icons/volume_mute.svg";
import VolumeOffIcon from "../assets/icons/volume_off.svg";

import { ThAudioKeys, ThAudioActionKeys } from "@/preferences/models";
import { ThSlider } from "@/core/Components/Settings/ThSlider";
import { useFirstFocusable } from "@/core/Components/Containers/hooks/useFirstFocusable";
import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";

import audioStyles from "../assets/styles/thorium-web.audioActions.module.css";

import { useNavigator } from "@/core/Navigator";
import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setVolume } from "@/lib/audioSettingsReducer";
import { toggleActionOpen, setActionOpen } from "@/lib/actionsReducer";

export const StatefulAudioVolume = ({ isDisabled }: { isDisabled: boolean }) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const volume = useAppSelector(state => state.audioSettings.volume);
  const isOpen = useAppSelector(state => state.actions.keys[ThAudioActionKeys.volume]?.isOpen ?? false);

  const { t } = useI18n();
  const { preferences } = useAudioPreferences();

  const dispatch = useAppDispatch();
  const { submitPreferences, getSetting } = useNavigator().media;

  const config = preferences.settings.keys[ThAudioKeys.volume];

  const VolumeIcon = useMemo(() => {
    if (volume === 0) return VolumeOffIcon;
    const max = Math.max(...config.range);
    if (volume <= max / 3) return VolumeMuteIcon;
    if (volume <= (max / 3) * 2) return VolumeDownIcon;
    return VolumeUpIcon;
  }, [volume, config.range]);

  const updatePreference = useCallback(async (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    await submitPreferences({ volume: val });
    const effectiveVolume = getSetting("volume");
    dispatch(setVolume(effectiveVolume));
  }, [submitPreferences, getSetting, dispatch]);

  useFirstFocusable({
    withinRef: contentRef,
    trackedState: isOpen,
    action: { type: "focus" }
  });

  return (
    <>
      <StatefulActionIcon
        ref={ triggerRef }
        tooltipLabel={ t("reader.playback.preferences.audio.volume") }
        placement="top"
        onPress={ () => dispatch(toggleActionOpen({ key: ThAudioActionKeys.volume })) }
        isDisabled={ isDisabled }
        className={ audioStyles.audioVolumeButton }
      >
        <VolumeIcon aria-hidden="true" focusable="false" />
      </StatefulActionIcon>
      <Popover
        triggerRef={ triggerRef }
        isOpen={ isOpen }
        onOpenChange={ (open) => dispatch(setActionOpen({ key: ThAudioActionKeys.volume, isOpen: open })) }
        placement="top"
        className={ audioStyles.audioControlPopover }
      >
        <Dialog aria-label={ t("reader.playback.preferences.audio.volume") } className={ audioStyles.audioControlPopoverDialog }>
          <ThSlider
            aria-label={ t("reader.playback.preferences.audio.volume") }
            className={ audioStyles.audioVolumeSlider }
            orientation="vertical"
            range={ config.range }
            step={ config.step }
            value={ volume }
            onChange={ updatePreference }
            compounds={ {
              wrapper: { ref: contentRef },
              track: { className: audioStyles.audioVolumeSliderTrack },
              thumb: { className: audioStyles.audioVolumeSliderThumb },
              output: { style: () => ({ display: "none" }) }
            } }
          />
        </Dialog>
      </Popover>
    </>
  );
};
