"use client";

import audioStyles from "./assets/styles/thorium-web.audioPlayback.module.css";

import { StatefulPreviousTrackButton } from "./StatefulPreviousTrackButton";
import { StatefulSkipBackwardButton } from "./StatefulSkipBackwardButton";
import { StatefulPlayPauseButton } from "./StatefulPlayPauseButton";
import { StatefulSkipForwardButton } from "./StatefulSkipForwardButton";
import { StatefulNextTrackButton } from "./StatefulNextTrackButton";

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
