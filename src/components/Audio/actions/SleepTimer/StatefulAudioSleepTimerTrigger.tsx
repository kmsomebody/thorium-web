"use client";

import SnoozeIcon from "./assets/icons/snooze.svg";

import { ThAudioActionKeys } from "@/preferences/models";
import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import { StatefulActionTriggerProps } from "../../../Actions/models/actions";

import audioStyles from "../assets/styles/thorium-web.audioActions.module.css";

import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleActionOpen } from "@/lib/actionsReducer";

export const StatefulAudioSleepTimerTrigger = ({ ref }: StatefulActionTriggerProps) => {
  const { t } = useI18n();

  const remainingSeconds = useAppSelector(state => state.player.sleepTimer.remainingSeconds);
  const onTrackEnd = useAppSelector(state => state.player.sleepTimer.onTrackEnd);
  const isTrackReady = useAppSelector(state => state.player.isTrackReady);
  const isStalled = useAppSelector(state => state.player.isStalled);
  const isDisabled = !isTrackReady || isStalled;

  const dispatch = useAppDispatch();

  const isActive = remainingSeconds !== null || onTrackEnd;

  const formatBadge = (seconds: number): string => {
    if (seconds < 60) return `${ seconds }${ t("audio.settings.sleepTimer.seconds") }`;
    return `${ Math.ceil(seconds / 60) }${ t("audio.settings.sleepTimer.minutes") }`;
  };

  return (
    <StatefulActionIcon
      ref={ ref }
      tooltipLabel={ t("reader.playback.preferences.sleepTimer.descriptive") }
      placement="top"
      onPress={ () => dispatch(toggleActionOpen({ key: ThAudioActionKeys.sleepTimer })) }
      isDisabled={ isDisabled }
      className={ audioStyles.audioSleepTimerButton }
    >
      <SnoozeIcon aria-hidden="true" focusable="false" />
      { isActive && (
        <span className={ audioStyles.audioSleepTimerLabel } aria-hidden="true">
          { onTrackEnd ? t("reader.playback.preferences.sleepTimer.presets.endOfResource") : formatBadge(remainingSeconds!) }
        </span>
      ) }
    </StatefulActionIcon>
  );
};
