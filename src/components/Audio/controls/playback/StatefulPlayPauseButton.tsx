"use client";

import { useCallback } from "react";

import PauseIcon from "./assets/icons/pause.svg";
import PlayIcon from "./assets/icons/play_arrow.svg";

import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import audioStyles from "../assets/styles/thorium-web.audioControls.module.css";

import { useNavigator } from "@/core/Navigator";
import { useAppSelector } from "@/lib/hooks";
import { useI18n } from "@/i18n/useI18n";

export const StatefulPlayPauseButton = ({ isDisabled }: { isDisabled?: boolean }) => {
  const { t } = useI18n();
  const { play, pause } = useNavigator().media;
  const isPlaying = useAppSelector(state => state.player.status === "playing");

  const handlePress = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  return (
    <StatefulActionIcon
      onPress={ handlePress }
      isDisabled={ isDisabled }
      aria-label={ isPlaying ? t("audio.player.pause") : t("audio.player.play") }
      tooltipLabel={ isPlaying ? t("audio.player.pause") : t("audio.player.play") }
      className={ audioStyles.audioPlayPauseButton }
    >
      {isPlaying ? (
        <PauseIcon aria-hidden="true" focusable="false" />
      ) : (
        <PlayIcon aria-hidden="true" focusable="false" />
      )}
    </StatefulActionIcon>
  );
};
