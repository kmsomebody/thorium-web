"use client";

import SpeedIcon from "./assets/icons/speed.svg";

import { ThAudioActionKeys } from "@/preferences/models";
import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import { StatefulActionTriggerProps } from "../../../Actions/models/actions";

import playbackStyles from "./assets/styles/thorium-web.playbackRate.module.css";

import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleActionOpen } from "@/lib/actionsReducer";

export const StatefulAudioPlaybackRateTrigger = ({ ref }: StatefulActionTriggerProps) => {
  const { t } = useI18n();

  const playbackRate = useAppSelector(state => state.audioSettings.playbackRate);
  const isTrackReady = useAppSelector(state => state.player.isTrackReady);
  const isStalled = useAppSelector(state => state.player.isStalled);
  const isDisabled = !isTrackReady || isStalled;

  const dispatch = useAppDispatch();

  return (
    <StatefulActionIcon
      ref={ ref }
      tooltipLabel={ t("reader.playback.preferences.playbackRate.descriptive") }
      placement="top"
      onPress={ () => dispatch(toggleActionOpen({ key: ThAudioActionKeys.playbackRate })) }
      isDisabled={ isDisabled }
      className={ playbackStyles.button }
    >
      <SpeedIcon aria-hidden="true" focusable="false" />
      <span className={ playbackStyles.label } aria-hidden="true">{ playbackRate }×</span>
    </StatefulActionIcon>
  );
};
