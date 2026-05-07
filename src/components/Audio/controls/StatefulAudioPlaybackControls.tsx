"use client";

import audioStyles from "./assets/styles/thorium-web.audioControls.module.css";

import { StatefulPreviousTrackButton } from "./playback/StatefulPreviousTrackButton";
import { StatefulSkipBackwardButton } from "./playback/StatefulSkipBackwardButton";
import { StatefulPlayPauseButton } from "./playback/StatefulPlayPauseButton";
import { StatefulSkipForwardButton } from "./playback/StatefulSkipForwardButton";
import { StatefulNextTrackButton } from "./playback/StatefulNextTrackButton";

import { ThActionsBar } from "@/core/Components/Actions/ThActionsBar";

import { useI18n } from "@/i18n/useI18n";
import { useAppSelector } from "@/lib/hooks";

export const StatefulAudioPlaybackControls = () => {
  const { t } = useI18n();
  const isTrackReady = useAppSelector(state => state.player.isTrackReady);
  const isStalled = useAppSelector(state => state.player.isStalled);

  return (
    <ThActionsBar className={ audioStyles.audioControls } aria-label={ t("audio.player.controls") }>
      <StatefulPreviousTrackButton isDisabled={ !isTrackReady || isStalled } />
      <StatefulSkipBackwardButton isDisabled={ !isTrackReady || isStalled } />
      <StatefulPlayPauseButton isDisabled={ !isTrackReady || isStalled } />
      <StatefulSkipForwardButton isDisabled={ !isTrackReady || isStalled } />
      <StatefulNextTrackButton isDisabled={ !isTrackReady || isStalled } />
    </ThActionsBar>
  );
};
