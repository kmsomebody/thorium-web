"use client";

import { useMemo } from "react";

import VolumeUpIcon from "./assets/icons/volume_up.svg";
import VolumeDownIcon from "./assets/icons/volume_down.svg";
import VolumeMuteIcon from "./assets/icons/volume_mute.svg";
import VolumeOffIcon from "./assets/icons/volume_off.svg";

import { ThAudioKeys, ThAudioActionKeys } from "@/preferences/models";
import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import { StatefulActionTriggerProps } from "../../../Actions/models/actions";

import audioStyles from "../assets/styles/thorium-web.audioActions.module.css";

import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";
import { useI18n } from "@/i18n/useI18n";
import { useEffectiveRange } from "../../../Settings/hooks/useEffectiveRange";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleActionOpen } from "@/lib/actionsReducer";
import { useNavigator } from "@/core/Navigator";

export const StatefulAudioVolumeTrigger = ({ ref }: StatefulActionTriggerProps) => {
  const { t } = useI18n();
  const { preferences } = useAudioPreferences();
  const { preferencesEditor } = useNavigator().media;

  const volume = useAppSelector(state => state.audioSettings.volume);
  const isTrackReady = useAppSelector(state => state.player.isTrackReady);
  const isStalled = useAppSelector(state => state.player.isStalled);
  const isDisabled = !isTrackReady || isStalled;

  const dispatch = useAppDispatch();

  const config = preferences.settings.keys[ThAudioKeys.volume];
  const { range } = useEffectiveRange(config.range, preferencesEditor?.volume?.supportedRange);

  const VolumeIcon = useMemo(() => {
    if (volume === 0) return VolumeOffIcon;
    const max = Math.max(...range);
    if (volume <= max / 3) return VolumeMuteIcon;
    if (volume <= (max / 3) * 2) return VolumeDownIcon;
    return VolumeUpIcon;
  }, [volume, range]);

  return (
    <StatefulActionIcon
      ref={ ref }
      tooltipLabel={ t("reader.playback.preferences.audio.volume") }
      placement="top"
      onPress={ () => dispatch(toggleActionOpen({ key: ThAudioActionKeys.volume })) }
      isDisabled={ isDisabled }
      className={ audioStyles.audioVolumeButton }
    >
      <VolumeIcon aria-hidden="true" focusable="false" />
    </StatefulActionIcon>
  );
};
